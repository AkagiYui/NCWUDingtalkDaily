let s = storages.create("DingtalkDaily");

module.exports = {
  getStudentID: () => s.get("studentID", ""),
  setStudentID: (studentID) => s.put("studentID", studentID),
  getName: () => s.get("name", ""),
  setName: (name) => s.put("name", name),
  getPhoneNumber: () => s.get("phoneNumber", ""),
  setPhoneNumber: (phoneNumber) => s.put("phoneNumber", phoneNumber),
  getAlbumName: () => s.get("albumName", ""),
  setAlbumName: (albumName) => s.put("albumName", albumName),
};