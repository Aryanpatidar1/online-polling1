import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { FaPoll, FaTrash, FaChartBar, FaPlusCircle } from "react-icons/fa";
import api from "../../api/api";
import { Link, Navigate } from "react-router-dom";

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 auth check
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchMyPolls = async () => {
    try {
      const res = await api.get("/poll/mine");
      setPolls(res.data.polls || []);
      setLoading(false);
    } catch (err) {
      console.log("Fetch dashboard error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMyPolls();
    } else {
      setLoading(false);
    }
  }, []);

  // ❌ NOT LOGGED IN SCREEN
  if (!user || !token) {
    return (
      <main className="page dashboard-page container">
        <div className="no-polls">
          <FaPoll className="no-icon" />
          <h2>You are not logged in</h2>
          <p>Please login to access your dashboard.</p>
          <Link to="/auth" className="btn">
            Login Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page dashboard-page container">
        <p className="loading">Loading your dashboard...</p>
      </main>
    );
  }

  // DELETE POLL
  const deleteMyPoll = async (id) => {
    try {
      await api.delete(`/poll/${id}`);
      fetchMyPolls();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="page dashboard-page container">
      <div className="dashboard-header">
        <h1>Your Polls</h1>
        <Link to="/create" className="btn create-btn">
          <FaPlusCircle /> Create Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="no-polls">
          <FaPoll className="no-icon" />
          <h2>No polls created yet</h2>
          <p>Create your first poll and start collecting votes!</p>
          <Link to="/create" className="btn">
            Create Poll
          </Link>
        </div>
      ) : (
        <div className="polls-table-box">
          <table className="polls-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Votes</th>
                <th>Status</th>
                <th>Created</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => (
                <tr key={poll._id}>
                  <td>{poll.question}</td>
                  <td>{poll.totalVotes}</td>
                  <td>
                    {poll.isActive ? (
                      <span className="status active">Active</span>
                    ) : (
                      <span className="status inactive">Expired</span>
                    )}
                  </td>
                  <td>
                    {new Date(poll.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="action-col">
                    <Link
                      className="btn small-btn view-btn"
                      to={`/poll/${poll.slug}`}
                    >
                      <FaChartBar /> View
                    </Link>
                    <button
                      className="btn small-btn delete-btn"
                      onClick={() => deleteMyPoll(poll._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
