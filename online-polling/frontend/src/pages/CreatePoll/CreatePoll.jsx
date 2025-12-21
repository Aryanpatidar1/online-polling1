import {useState} from "react";
import "./CreatePoll.css";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import api from "../../api/api";

const CreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // mininmum 2 option rahenge
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [maxVotesPerUser, setMaxVotesPerUser] = useState(1);
  const [showResultsMode, setShowResultsMode] = useState("always");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [shareLink, setShareLink] = useState("");

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) {
      // maximum 6 options ho sakte hai
      return;
    }

    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions(options.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!question.trim()) {
      setErrorMsg("Question is required.");
      return false;
    }

    const cleanedOptions = options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (cleanedOptions.length < 2) {
      setErrorMsg("At least 2 options are required.");
      return false;
    }

    if (maxVotesPerUser < 1) {
      setErrorMsg("Max votes per user must be at least 1.");
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setShareLink("");
    if (!validateForm()) return;

    const cleanedOptions = options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const payload = {
      question: question.trim(),
      options: cleanedOptions,
      settings: {
        allowAnonymous,
        maxVotesPerUser,
        showResultsMode,
        expiresAt: expiresAt || null,
      },
    };

    try {
      setLoading(true);
      const res = await api.post("/poll", payload);

      setSuccessMsg("Poll created successfully!");
      const slug = res.data?.poll?.slug;
      if (slug) {
        const link = `${window.location.origin}/poll/${slug}`;
        setShareLink(link);
      }
      // optional: form reset
      // setQuestion("");
      // setOptions(["", ""]);
    } catch (err) {
      console.error("Create poll error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to create poll. Make sure you are logged in.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page create-poll-page container">
      <h2 className="create-title">Create a new poll</h2>
      <p className="create-subtitle">
        Write your question, add options, set poll rules, and share it with a
        link.
      </p>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form className="create-form" onSubmit={handleSubmit}>
        {/* question */}
        <div className="form-group">
          <label>Poll Question</label>
          <textarea
            rows="2"
            placeholder="e.g. Which programming language do you prefer for web development?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* pptions */}
        <div className="form-group">
          <label>Options</label>
          <div className="options-wrapper">
            {options.map((opt, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="icon-btn remove-btn"
                    onClick={() => removeOption(index)}
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              className="btn small-btn add-option-btn"
              onClick={addOption}
            >
              <FaPlus />
              <span>Add Option</span>
            </button>
          )}
        </div>

        {/* settings */}
        <div className="settings-grid">
          {/* anonymous toggle */}
          <div className="form-group">
            <label>Anonymous voting</label>
            <div className="toggle-row">
              <span>Allow people to vote without login</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* max votes */}
          <div className="form-group">
            <label>Max votes per user</label>
            <input
              type="number"
              min="1"
              value={maxVotesPerUser}
              onChange={(e) => setMaxVotesPerUser(Number(e.target.value) || 1)}
            />
          </div>

          {/* show results mode */}
          <div className="form-group">
            <label>Show results</label>
            <select
              value={showResultsMode}
              onChange={(e) => setShowResultsMode(e.target.value)}
            >
              <option value="always">Always visible</option>
              <option value="afterVote">Only after voting</option>
              <option value="never">Hidden from voters</option>
            </select>
          </div>

          {/* expiry */}
          <div className="form-group">
            <label>Expiry (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <small className="hint">
              Leave empty if you don't want the poll to expire.
            </small>
          </div>
        </div>

        {/* submit */}
        <div className="form-actions">
          <button className="btn create-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>

        {/* share link */}
        {shareLink && (
          <div className="share-box">
            <p>Your poll link:</p>
            <div className="share-link-row">
              <input type="text" readOnly value={shareLink} />
              <button
                type="button"
                className="btn small-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
};

export default CreatePoll;
