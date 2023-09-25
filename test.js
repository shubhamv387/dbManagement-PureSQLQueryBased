const fields = [
  { fieldName: "empName", fieldType: "STRING" },
  { fieldName: "empEmail", fieldType: "STRING" },
  { fieldName: "empPhone", fieldType: "STRING" },
  { fieldName: "empSalary", fieldType: "NUMBER" },
];

[
  { name: "ID", type: "INT AUTO_INCREMENT PRIMARY KEY" },
  { name: "FirstName", type: "VARCHAR(50)" },
  { name: "LastName", type: "VARCHAR(50)" },
  { name: "Email", type: "VARCHAR(100)" },
  { name: "Salary", type: "DECIMAL(10, 2)" },
  { name: "HireDate", type: "DATE" },
];

const obj = {
  tableName: "employee",
  firstName: "Shubham",
  lastName: "Vishwakarma",
  email: "shubhamv387@gmail.com",
  salary: 50000.0,
};

const valArray = [];

for (let key in obj) {
  if (key !== "tableName") valArray.push(obj[key]);
}

console.log(valArray);
