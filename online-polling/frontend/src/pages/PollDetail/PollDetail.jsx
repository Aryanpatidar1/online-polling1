import {useEffect, useState} from 'react'
import './PollDetail.css'
import api from '../../api/api'
import socket from '../../socket'
import { FaChartBar, FaVoteYea, FaExclamationTriangle, FaClock, FaShareAlt } from 'react-icons/fa'
import { useParams } from 'react-router-dom'

const PollDetail = () => {


    const { slug } = useParams();

    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [expired, setExpired] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");


    // poll ko slug se fetch karenge
    const fetchPoll = async ()=>{
        try {
            const res = await api.get(`/poll/${slug}`);
            setPoll(res.data.poll);

            if(res.data.poll?.isActive === false)
            {
                setExpired(true);
            }

            setResults(
                res.data.poll.options.map((opt) => ({
                    id: opt._id,
                    text: opt.text,
                    voteCount: opt.voteCount,
                    percentage: res.data.poll.totalVotes > 0 ? ((opt.voteCount / res.data.poll.totalVotes) * 100).toFixed(1) : 0,
                }))
            );

            setLoading(false);
        } catch (error) {
            console.log(error);
            setErrorMsg("Poll not found or server error.");
            setLoading(false);
            
        }
    };

    useEffect(() => {
        fetchPoll();
    }, [slug]);


    // live update using socket
    useEffect(() => {
        if(!poll){
            return;
        }

        socket.emit("joinPoll", poll._id);

        socket.on("pollUpdated", (data) => {
            if(data.pollId === poll._id)
            {
                setResults(data.results);
            }
        });

        return () =>{
            socket.off("pollUpdated");
        };
    }, [poll]);


    // vote handling
    const handleVote = async (optionId) => {
        if(voted || expired)
        {
            return;
        }

        try {
            const res = await api.post(`/votes/${poll._id}`, {optionId});

            setVoted(true);

            // update results immediately
            setResults(res.data.results);
            setPoll((prev) => prev ? {...prev, totalVotes: res.data.totalVotes} : prev);
        } catch (error) {
            const msg = error.response?.data?.message || "Unable to cast vote at the moment.";
            setErrorMsg(msg);
        }
    };

    const sharePoll = () => {
        const link = `${window.location.origin}/poll/${poll.slug}`;
        navigator.clipboard.writeText(link);
        setErrorMsg("Link copied! Share with anyone.");
    };

    if(loading){
        return (
            <main className='page poll-dtaile-page container'>
                <p className='laoding'>Loading poll...</p>
            </main>
        )
    }

    if(!poll)
    {
        return (
            <main className="page poll-detail-page container">
                <p className="error">{errorMsg}</p>
            </main>
        );
    }

  return (
    <main className="page poll-detail-page container">
      <div className="poll-card">
        {/* header */}
        <div className="poll-header">
          <h1>{poll.question}</h1>

          {expired && (
            <div className="poll-expired">
              <FaClock />
              <span>Poll Expired</span>
            </div>
          )}
          <button className="btn share-btn" onClick={sharePoll}>
            <FaShareAlt />
            <span>Share</span>
          </button>
        </div>

        
        <div className="poll-options">
          {results.map((opt) => (
            <div key={opt.id} className="poll-option">
              <div className="option-top">
                <span className="opt-text">{opt.text}</span>

                {(voted || poll.settings.showResultsMode === "always") && (
                  <span className="opt-percent">{opt.percentage}%</span>
                )}
              </div>

              {(voted || poll.settings.showResultsMode === "always") && (
                <div className="result-bar">
                  <div
                    className="result-fill"
                    style={{ width: `${opt.percentage}%` }}
                  ></div>
                </div>
              )}

              {!voted &&
                poll.settings.showResultsMode !== "never" &&
                !expired && (
                  <button
                    className="btn vote-btn"
                    onClick={() => handleVote(opt.id)}
                  >
                    <FaVoteYea />
                    <span>Vote</span>
                  </button>
                )}

              {!voted && poll.settings.showResultsMode === "never" && (
                <button
                  className="btn vote-btn"
                  onClick={() => handleVote(opt.id)}
                >
                  <FaVoteYea />
                  <span>Vote</span>
                </button>
              )}
            </div>
          ))}
        </div>

        
        <div className="poll-footer">
          <FaChartBar />
          <span>Total Votes: {poll.totalVotes}</span>
        </div>

        {errorMsg && (
          <div className="vote-error">
            <FaExclamationTriangle />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </main>
  )
}

export default PollDetail
