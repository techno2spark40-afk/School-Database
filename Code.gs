function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('স্কুল ম্যানেজমেন্ট ERP সিস্টেম')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* DATABASE UTILITIES */
function getSheetData(sheetName) {
  // শুধু যদি কাজ না করে তবেই এটি করবেন, অন্যথায় করার দরকার নেই
const ss = SpreadsheetApp.openById("1khMELkp-jvEBeITncaaxpZ_0oCBXWSJEW6_9Dzw2-_c");
  const sheet = ss.getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const data = [];
  for (let i = 1; i < values.length; i++) {
    let row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }
  return data;
}

function logActivity(user, action) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ActivityLog');
  sheet.appendRow([user, action, new Date().toLocaleString('bn-BD')]);
}

/* AUTHENTICATION SYSTEM */
function loginUser(username, password) {
  const users = getSheetData('Users');
  const user = users.find(u => u.Username === username && u.Password === password);
  
  if (!user) return { success: false, message: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" };
  if (user.Status !== 'Active') return { success: false, message: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে!" };
  
  logActivity(username, "লগইন করেছেন");
  return { success: true, role: user.Role, userId: user.UserID, username: user.Username };
}

/* DASHBOARD METRICS */
function getDashboardData() {
  const students = getSheetData('Students');
  const teachers = getSheetData('Teachers');
  
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const activeStudents = students.filter(s => s.Status === 'Active').length;
  const activeTeachers = teachers.filter(t => t.Status === 'Active').length;
  
  return {
    totalStudents,
    totalTeachers,
    activeStudents,
    activeTeachers,
    recentStudents: students.slice(-5).reverse(),
    recentTeachers: teachers.slice(-5).reverse()
  };
}

/* CRUD OPERATIONS: STUDENTS */
function saveStudent(studentData, base64Photo, base64Cert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentSheet = ss.getSheetByName('Students');
  const userSheet = ss.getSheetByName('Users');
  
  // Handle Simulated File Uploads (Save Data URLs directly or extend via DriveApp)
  if (base64Photo) studentData.Photo = base64Photo;
  if (base64Cert) studentData.BirthCertFile = base64Cert;
  
  const headers = studentSheet.getDataRange().getValues()[0];
  const newRow = headers.map(header => studentData[header] || "");
  
  studentSheet.appendRow(newRow);
  
  // Auto-generate student user credential mapping
  userSheet.appendRow([studentData.StudentID, studentData.StudentID, "123456", "Student", "Active"]);
  logActivity("Admin", `নতুন শিক্ষার্থী যুক্ত করা হয়েছে: ${studentData.StudentID}`);
  return { success: true };
}

/* SYSTEM RESULT CALCULATION */
function calculateGPAAndGrade(marks) {
  let m = parseFloat(marks);
  if (m >= 80) return { gpa: 5.0, grade: "A+" };
  if (m >= 70) return { gpa: 4.0, grade: "A" };
  if (m >= 60) return { gpa: 3.5, grade: "A-" };
  if (m >= 50) return { gpa: 3.0, grade: "B" };
  if (m >= 40) return { gpa: 2.0, grade: "C" };
  if (m >= 33) return { gpa: 1.0, grade: "D" };
  return { gpa: 0.0, grade: "F" };
}

function addResult(resultData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Results');
  const calc = calculateGPAAndGrade(resultData.Marks);
  
  const resultID = "RES" + Math.floor(100000 + Math.random() * 900000);
  sheet.appendRow([
    resultID, resultData.StudentID, resultData.FullName, resultData.Class,
    resultData.Subject, resultData.Marks, calc.gpa, calc.grade, resultData.Year
  ]);
  return { success: true };
}

/* GENERIC DATA READERS FOR CLIENT FETCH */
function getSystemData() {
  return {
    students: getSheetData('Students'),
    teachers: getSheetData('Teachers'),
    results: getSheetData('Results'),
    users: getSheetData('Users')
  };
}
