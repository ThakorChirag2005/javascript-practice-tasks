
export const getTotal = (marks) =>
    Object.values(marks).reduce((total, mark) => total + mark, 0);

export const getPercentage = (total, subjectCount) =>
    Number(((total / (subjectCount * 100)) * 100).toFixed(2));

export const getGrade = (percentage) =>
    percentage >= 90 ? "A+" :
    percentage >= 75 ? "A" :
    percentage >= 60 ? "B" :
    percentage >= 40 ? "C" : "F";

export const hasPassed = (marks, passMark = 40) =>
    Object.values(marks).every((mark) => mark >= passMark);
