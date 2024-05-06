import MySQLDriver from "./../../../db/mysql/connection";

export default function userSearch(searchQuery: string) {
  const queryString = `
    SELECT * 
    FROM users 
    WHERE 
      firstname LIKE ? OR 
      lastname LIKE ? OR 
      username LIKE ?
  `;
  const params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

  return MySQLDriver.queryAsync(queryString, params);
}
