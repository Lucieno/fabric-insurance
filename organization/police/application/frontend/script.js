function onReport() {
  var owner = document.getElementById("owner").value;
  var issuer = document.getElementById("issuer").value;
  var good = document.getElementById("good").value;
  var issueNo = document.getElementById("issueNo").value;
  if (!owner || !good || !issueNo || !issuer){
    alert("invalid input");
    return;
  }
  axios.get(`/api/report?owner=${owner}&issuer=${issuer}&good=${good}&insuranceNo=${issueNo}`)
  .then(res => alert("report insurance success!"))
  .catch(err => alert(err.response.data));
}

