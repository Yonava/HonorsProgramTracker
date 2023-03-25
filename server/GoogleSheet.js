import { google } from 'googleapis';

export default class GoogleSheet {
  spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';
  sheets;
  static instance;

  static async getInstance(auth, authCode) {
    if (!GoogleSheet.instance) {
      try {
        GoogleSheet.instance = await new GoogleSheet().init(auth, authCode);
      } catch (e) {
        throw e
      }
    }

    return GoogleSheet.instance;
  }

  async init(auth, authCode) {
    try {
      const { tokens } = await auth.getToken(authCode);
      auth.setCredentials(tokens);
    } catch (e) {
      throw e
    }

    this.sheets = google.sheets({ 
      version: 'v4', 
      auth
    });

    return this;
  }

  async addStudent(student) {
    let students = (await this.getStudents()).map(row => row.join(''));
    let insertRow = students.indexOf('');
    insertRow = insertRow === -1 ? students.length + 1: insertRow + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${insertRow}:Z${insertRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [student]
      }
    });
  }

  async getModules(studentId) {
    const modules = (await this.getAllModules()).filter(row => row[0] === studentId);
    return modules;
  }

  async addModule(module) {
    const modules = (await this.getAllModules()).map(row => row.join(''));
    let insertRow = modules.indexOf('');
    insertRow = insertRow === -1 ? modules.length + 2 : insertRow + 2;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Modules!A${insertRow}:Z${insertRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [module]
      }
    });
  }

  async deleteModule(studentId, courseCode) {
    const modules = await this.getAllModules();
    const row = modules.findIndex(row => row[0] === studentId && row[1] === courseCode);
    if (row === -1) return;
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `Modules!A${row + 2}:Z${row + 2}`,
    });
  }

  async getAllModules() {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Modules',
    });

    return response.data.values.slice(1);
  }

  async getRange(range) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return response.data.values;
  }

  async clearByRow(range, row) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${row}:Z${row}`,
    });
  }

  async updateByRow(range, row, data) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${row}:Z${row}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: data
      }
    });
  }
}