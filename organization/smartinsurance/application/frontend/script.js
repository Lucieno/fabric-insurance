function onIssue() {
  var owner = document.getElementById("owner").value;
  var good = document.getElementById("good").value;
  var issueNo = document.getElementById("issueNo").value;
  if (!owner || !good || !issueNo){
    alert("invalid input");
    return;
  }
  axios.get(`/api/issue?owner=${owner}&good=${good}&insuranceNo=${issueNo}`)
  .then(res => alert("issue insurance success!"))
  .catch(err => alert(err.response.data));
}

function onRefund() {
  var refundNo = document.getElementById("refundNo").value;
  if (!refundNo) {
    alert("invalid input");
    return;
  }
  axios.get(`/api/refund?insuranceNo=${refundNo}`)
  .then(res => alert("refund success!"))
  .catch(err => alert(err.response.data));
}
