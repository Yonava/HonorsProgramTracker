import { google } from 'googleapis';

export default class GoogleSheet {
  spreadsheetId = '1j14nkncHzlj_LPMvKzboKqAcViHjB6RuezbNZ8n8scI';
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

  async getStudents() {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Students',
    });

    return response.data.values;
  }

  async getStudent(studentId) {
    const students = await this.getStudents();
    const row = students.find(row => row[1] === studentId);
    const columns = ['name', 'id', 'email', 'points', 'activeStatus', 'note']
    if (!row) return;
    return columns.reduce((acc, val, i) => {
      acc[val] = row[i];
      return acc;
    }, {});
  }

  async deleteStudent(row) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${row}:Z${row}`,
    });
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

  async updateStudent(student) {
    const { misc, row, ...rest } = student
    const studentData = [...Object.values(rest)]

    if (Object.values(misc).length > 0) {
      studentData.push(...(await this.getMiscCategories()).map(cat => misc[cat] ?? ''))
    }

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${row}:Z${row}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [studentData]
      }
    });
  }

  async getMiscCategories() {
    const { data } = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Students!G1:Z1',
    });

    return data.values[0];
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
}