
import { students } from "./data.js";

import {
    getTotal,
    getPercentage,
    getGrade,
    hasPassed
} from "./utils.js";

// Keep a copy of the original data to verify it later.
const originalStudents = JSON.stringify(students);

// Bonus: Skip students with invalid marks.
const validStudents = students.filter((student) => {
    const marks = Object.values(student.marks);

    const hasInvalidMarks = marks.some(
        (mark) => mark < 0 || mark > 100
    );

    if (hasInvalidMarks) {
        console.warn(`Invalid marks found for ${student.name}. Student skipped.`);
    }

    return !hasInvalidMarks;
});

// Build the result array using map and destructuring.
const results = validStudents.map(({ id, name, marks }) => {
    const total = getTotal(marks);
    const percentage = getPercentage(total, Object.keys(marks).length);
    const grade = getGrade(percentage);
    const status = hasPassed(marks) ? "PASS" : "FAIL";

    return { id, name, total, percentage, grade, status };
});

// Sort a copy. Do not change the original results array.
const rankedResults = [...results].sort(
    (a, b) => b.percentage - a.percentage
);

// Print the ranked table in the browser console.
console.table(
    rankedResults.map(({ name, total, percentage, grade, status }, index) => ({
        Rank: index + 1,
        Name: name,
        Total: total,
        "%": percentage,
        Grade: grade,
        Status: status
    }))
);

// Calculate class average.
const classAverage = Number(
    (
        results.reduce((sum, student) => sum + student.percentage, 0) /
        results.length
    ).toFixed(2)
);

// Use find to get the topper from the ranked results.
const topper = rankedResults.find(
    ({ percentage }) => percentage === rankedResults[0].percentage
);

// Get passed and failed students.
const passedStudents = results.filter(
    ({ status }) => status === "PASS"
);

const failedStudents = results.filter(
    ({ status }) => status === "FAIL"
);

const failedNames = failedStudents.map(({ name }) => name);

// Print the summary using template literals.
console.log(`Class average : ${classAverage}%`);
console.log(`Topper : ${topper.name}`);
console.log(`Passed : ${passedStudents.length}`);
console.log(`Failed : ${failedStudents.length} (${failedNames.join(", ")})`);

// Find the highest scorer in every subject.
const subjects = Object.keys(students[0].marks);

subjects.forEach((subject) => {
    const subjectTopper = validStudents.reduce(
        (best, student) =>
            student.marks[subject] > best.marks[subject]
                ? student
                : best,
        validStudents[0]
    );

    console.log(
        `Top in ${subject} : ${subjectTopper.name} (${subjectTopper.marks[subject]})`
    );
});

// Use Object.entries to display every student's subject marks.
console.log("Subject-wise marks:");

validStudents.forEach(({ name, marks }) => {
    const subjectDetails = Object.entries(marks)
        .map(([subject, mark]) => `${subject}: ${mark}`)
        .join(", ");

    console.log(`${name} — ${subjectDetails}`);
});

// Bonus: Build a result table on the webpage.
const table = document.createElement("table");
const caption = document.createElement("caption");
caption.textContent = "Student Class Result Report";
table.appendChild(caption);

const tableHead = document.createElement("thead");
const headerRow = document.createElement("tr");

["Rank", "Name", "Total", "%", "Grade", "Status", "Subject Marks"]
    .forEach((heading) => {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
    });

tableHead.appendChild(headerRow);
table.appendChild(tableHead);

const tableBody = document.createElement("tbody");

rankedResults.forEach(({ id, name, total, percentage, grade, status }, index) => {
    const student = validStudents.find((item) => item.id === id);
    const row = document.createElement("tr");

    const subjectDetails = Object.entries(student.marks)
        .map(([subject, mark]) => `${subject}: ${mark}`)
        .join(", ");

    [
        index + 1,
        name,
        total,
        `${percentage}%`,
        grade,
        status,
        subjectDetails
    ].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
    });

    tableBody.appendChild(row);
});

table.appendChild(tableBody);

// Add basic styling using JavaScript.
table.style.borderCollapse = "collapse";
table.style.width = "100%";
table.style.fontFamily = "Arial, sans-serif";

table.querySelectorAll("th, td").forEach((cell) => {
    cell.style.border = "1px solid #999";
    cell.style.padding = "8px";
    cell.style.textAlign = "left";
});

table.querySelector("caption").style.fontSize = "20px";
table.querySelector("caption").style.fontWeight = "bold";
table.querySelector("caption").style.padding = "12px";

document.body.appendChild(table);

// Prove that the original student data remains unchanged.
console.log(
    `Original students unchanged: ${originalStudents === JSON.stringify(students)}`
);
console.log("Original students:", students);
