import { roleRequests, uploadRequests } from "../utils/mockData";
 
const RequestsPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Requests Page</h2>
 
      <h3>Role Upgrade Requests</h3>
      {roleRequests.map((req, i) => (
        <div key={i}>
          {req.user} wants {req.requestedRole} - {req.status}
        </div>
      ))}
 
      <h3>Upload Requests</h3>
      {uploadRequests.map((req, i) => (
        <div key={i}>
          {req.data} - {req.status}
        </div>
      ))}
    </div>
  );
};
 
export default RequestsPage;