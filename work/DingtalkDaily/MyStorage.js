var myStorage = {};
var s = storages.create("DingtalkDaily");
myStorage.getStudentID = () => s.get("studentID", "");
myStorage.setStudentID = (studentID) => s.put("studentID", studentID);
myStorage.getName = () => s.get("name", "");
myStorage.setName = (name) => s.put("name", name);
myStorage.getPhoneNumber = () => s.get("phoneNumber", "");
myStorage.setPhoneNumber = (phoneNumber) => s.put("phoneNumber", phoneNumber);
myStorage.getAlbumName = () => s.get("albumName", "");
myStorage.setAlbumName = (albumName) => s.put("albumName", albumName);

module.exports = myStorage;
