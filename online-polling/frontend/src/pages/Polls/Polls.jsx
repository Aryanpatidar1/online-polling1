import { useEffect, useState } from "react";
import api from "../../api/api";
import "./Polls.css";
import { Link } from "react-router-dom";
import { FaChartBar, FaUsers, FaCalendarAlt, FaShareAlt } from "react-icons/fa";

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPolls = async () => {
    try {
      const res = await api.get("/poll");
      setPolls(res.data.polls || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to load polls.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const copyLink = (slug) => {
    const link = `${window.location.origin}/poll/${slug}`;
    navigator.clipboard.writeText(link);
    setError("Poll link copied!");
    setTimeout(() => setError(""), 1500);
  };

  if (loading) {
    return (
      <main className="page polls-page container">
        <p className="loading">Loading polls...</p>
      </main>
    );
  }

  return (
    <main className="page polls-page container">
      <div className="polls-header">
        <div>
          <h1>Explore Polls</h1>
          <p>Vote on any public poll or share it with friends.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {polls.length === 0 ? (
        <p>No polls available yet.</p>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <div className="poll-card" key={poll._id}>
              <div className="poll-card-top">
                <h3>{poll.question}</h3>
                <span className={`status ${poll.isActive ? "active" : "inactive"}`}>
                  {poll.isActive ? "Active" : "Expired"}
                </span>
              </div>

              <div className="poll-meta">
                <span>
                  <FaUsers /> {poll.totalVotes} votes
                </span>
                <span>
                  <FaCalendarAlt /> {new Date(poll.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              <div className="poll-actions">
                <Link className="btn small-btn" to={`/poll/${poll.slug}`}>
                  <FaChartBar /> View Poll
                </Link>
                <button className="btn small-btn outline" onClick={() => copyLink(poll.slug)}>
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Polls;

