const company = {
  name: "TechCorp",
  departments: {
    1: { id: 1, name: "Engineering", teamIds: [101, 102] },
    2: { id: 2, name: "Marketing", teamIds: [201] },
  },
  teams: {
    101: { id: 101, name: "Frontend Team", employeeIds: [1001, 1002] },
    102: { id: 102, name: "Backend Team", employeeIds: [1003, 1004] },
    201: { id: 201, name: "SEO Team", employeeIds: [2001, 2002] },
  },
  employees: {
    1001: { id: 1001, name: "Alice" },
    1002: { id: 1002, name: "Bob" },
    1003: { id: 1003, name: "Charlie" },
    1004: { id: 1004, name: "David" },
    2001: { id: 2001, name: "Eve" },
    2002: { id: 2002, name: "Frank" },
  },
};

export default company;
