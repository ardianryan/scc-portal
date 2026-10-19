const axios = require('axios');
const config = require('../config');

/**
 * GZCTF API Client
 * Mengotomasi pembuatan akun dan interaksi tim dengan backend GZCTF
 */
class GzctfService {
  constructor() {
    this.baseUrl = config.GZCTF_URL;
  }

  /**
   * Mendaftarkan akun peserta langsung ke GZCTF
   * Endpoint: POST /api/account/register
   * Payload: { userName, email, password }
   */
  async registerAccount(username, email, password) {
    try {
      const url = `${this.baseUrl}/api/account/register`;
      const response = await axios.post(url, {
        userName: username,
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data,
        message: 'Akun GZCTF berhasil dibuat.'
      };
    } catch (err) {
      let errorMsg = 'Gagal menghubungi server GZCTF.';
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else {
          errorMsg = `GZCTF mengembalikan status ${err.response.status}`;
        }
      } else if (err.code === 'ECONNREFUSED') {
        errorMsg = 'Koneksi ke GZCTF ditolak (server GZCTF offline atau URL salah).';
      } else if (err.message) {
        errorMsg = err.message;
      }

      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Login ke akun peserta GZCTF dan kembalikan Cookie sesi
   * Endpoint: POST /api/account/login
   */
  async loginAccount(username, password) {
    try {
      const url = `${this.baseUrl}/api/account/login`;
      const response = await axios.post(url, {
        userName: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const setCookies = response.headers['set-cookie'];
      const cookieHeader = Array.isArray(setCookies) ? setCookies.map(c => c.split(';')[0]).join('; ') : '';

      return {
        success: true,
        cookie: cookieHeader
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }

  /**
   * Membuat Tim Baru di GZCTF menggunakan sesi Ketua
   * Endpoint: POST /api/team
   */
  async createTeam(captainCookie, teamName, bio = 'Tim SCC::CTF 2026') {
    try {
      const url = `${this.baseUrl}/api/team`;
      const response = await axios.post(url, {
        name: teamName,
        bio: bio
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': captainCookie
        },
        timeout: 10000
      });

      // Response berisi TeamInfoModel { id, name, inviteCode, ... }
      const teamData = response.data;
      const inviteCode = teamData.inviteCode || `${teamName}:${teamData.id}:${teamData.inviteToken}`;

      return {
        success: true,
        teamId: teamData.id,
        inviteCode: inviteCode,
        data: teamData
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }

  /**
   * Menggabungkan (Join) Anggota ke Tim menggunakan Invite Code
   * Endpoint: POST /api/team/accept
   */
  async joinTeamWithCode(memberCookie, inviteCode) {
    try {
      const url = `${this.baseUrl}/api/team/accept`;
      await axios.post(url, JSON.stringify(inviteCode), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': memberCookie
        },
        timeout: 10000
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }

  /**
   * Otomasi Penuh: Buat Akun Anggota, Buat Tim di GZCTF, dan Auto-Join
   */
  async provisionFullTeam(teamName, leader, members) {
    const results = {
      leaderRegistered: false,
      membersRegistered: [],
      teamCreated: false,
      gzctfTeamId: null,
      membersJoined: [],
      errors: []
    };

    // 1. Daftarkan Akun Ketua
    const leaderReg = await this.registerAccount(leader.username, leader.email, leader.password);
    if (!leaderReg.success) {
      results.errors.push(`Ketua (${leader.username}): ${leaderReg.error}`);
    } else {
      results.leaderRegistered = true;
    }

    // 2. Daftarkan Akun Seluruh Anggota
    for (const m of members) {
      const mReg = await this.registerAccount(m.username, m.email, m.password);
      if (!mReg.success) {
        results.errors.push(`Anggota (${m.username}): ${mReg.error}`);
        results.membersRegistered.push({ username: m.username, success: false, error: mReg.error });
      } else {
        results.membersRegistered.push({ username: m.username, success: true });
      }
    }

    // 3. Login Ketua & Buat Tim di GZCTF
    const leaderLogin = await this.loginAccount(leader.username, leader.password);
    if (!leaderLogin.success) {
      results.errors.push(`Login Ketua gagal: ${leaderLogin.error}`);
      return results;
    }

    const teamRes = await this.createTeam(leaderLogin.cookie, teamName);
    if (!teamRes.success) {
      results.errors.push(`Gagal membuat Tim di GZCTF: ${teamRes.error}`);
      return results;
    }

    results.teamCreated = true;
    results.gzctfTeamId = teamRes.teamId;
    const inviteCode = teamRes.inviteCode;

    // 4. Login Tiap Anggota & Auto-Join ke Tim
    for (const m of members) {
      const mLogin = await this.loginAccount(m.username, m.password);
      if (mLogin.success && inviteCode) {
        const joinRes = await this.joinTeamWithCode(mLogin.cookie, inviteCode);
        if (joinRes.success) {
          results.membersJoined.push({ username: m.username, joined: true });
        } else {
          results.errors.push(`Auto-join ${m.username}: ${joinRes.error}`);
          results.membersJoined.push({ username: m.username, joined: false, error: joinRes.error });
        }
      }
    }

    return results;
  }

  /**
   * Tes konektivitas ke server GZCTF
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/edit/configs`, {
        timeout: 5000,
        validateStatus: () => true
      });
      return { reachable: true, status: response.status };
    } catch (err) {
      return { reachable: false, error: err.message };
    }
  }
}

module.exports = new GzctfService();
