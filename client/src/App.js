import React, { Component } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import './App.css';

class App extends Component {
  state = {
    username: '',
    newComment: '',
    comments: [],
  };

  updateInput = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  postComment = event => {
    event.preventDefault();
    const { username, newComment } = this.state;
    if (username.trim() === '' || newComment.trim() === '') return;

    const data = {
      name: username,
      text: newComment,
      votes: 0,
    };

    axios
      .post('http://localhost:5000/comment', data)
      .then(() => {
        this.setState({
          username: '',
          newComment: '',
        });
      })
      .catch(error => console.log(error));
  };

  vote = (id, num) => {
    axios.post('http://localhost:5000/vote', {
      id,
      vote: num,
    });
  };

  componentDidMount() {
    const pusher = new Pusher('6f1be800f23677de029d', {
      cluster: 'us2',
      encrypted: true,
    });

    axios
      .get('http://localhost:5000')
      .then(({ data }) => {
        this.setState({
          comments: [...data],
        });
      })
      .catch(error => console.log(error));

    const channel = pusher.subscribe('comments');
    channel.bind('new-comment', data => {
      this.setState(prevState => {
        const { comments } = prevState;
        comments.push(data.comment);

        return {
          comments,
        };
      });
    });

    channel.bind('new-vote', data => {
      let { comments } = this.state;
      comments = comments.map(e => {
        if (e._id === data.doc._id) {
          return data.doc;
        }

        return e;
      });

      this.setState({
        comments,
      });
    });
  }

  render() {
    const { username, newComment, comments } = this.state;

    const userComments = comments.map(e => (
      <article className="comment" key={e._id}>
        <h1 className="comment-user">{e.name}</h1>
        <p className="comment-text">{e.text}</p>
        <div className="voting">
          <div className="vote-buttons">
            <button className="upvote" onClick={() => this.vote(e._id, 1)}>
              Upvote
            </button>
            <button className="downvote" onClick={() => this.vote(e._id, -1)}>
              Downvote
            </button>
          </div>
          <div className="votes">Votes: {e.votes}</div>
        </div>
      </article>
    ));

    return (
      <div className="App">
        <article className="post">
          <h1>Interesting Video</h1>
          <iframe
            title="video"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/PC60fAKJiek"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <p>Leave a comment if you enjoyed the video above</p>
        </article>
        <section className="comments-form">
          <form onSubmit={this.postComment}>
            <label htmlFor="username">Name:</label>
            <input
              className="username"
              name="username"
              id="username"
              type="name"
              value={username}
              onChange={this.updateInput}
            />

            <label htmlFor="new-comment">Comment:</label>
            <textarea
              className="comment"
              name="newComment"
              id="new-comment"
              value={newComment}
              onChange={this.updateInput}
            />
            <button type="submit">Have your say</button>
          </form>
        </section>
        <section className="comments-section">{userComments}</section>
      </div>
    );
  }
}

export default App;

