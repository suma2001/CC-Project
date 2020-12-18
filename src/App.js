import React, { useState } from 'react';
import './App.css';

// Import Amplify and Storage
import Amplify, { Storage } from 'aws-amplify';
// withAuthenticator is a higher order component that wraps the application with a login page
import { withAuthenticator } from 'aws-amplify-react';
// Import the project config files and configure them with Amplify
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

class App extends React.Component {
  constructor(props) {
    super(props)
      this.state = {
        value: "",
        imageUrl: null,
        loading: false
      }
      this.handleChange = this.handleChange.bind(this)
  }
  
  downloadUrl = async () => {
    // Creates download url that expires in 5 minutes/ 300 seconds
    const downloadUrl = await Storage.get('image.jpg', { expires: 300 });
    window.location.href = downloadUrl
  }

  handleNewChange = (e) => {
      this.setState({value: e.target.value})
      console.log(this.state.value)
  }

  handleSubmit(event) {
    alert("A name submitted: " + this.state.value)
  }

  handleChange = async (e) => {
    const file = e.target.files[0];
    try {
      this.setState({loading: true})
      // Upload the file to s3 with private access level. 
      await Storage.put('image.jpg', file, {
        level: 'private',
        contentType: 'image/jpg',
        metadata: {
          "fullname": this.state.value
        }
      });
      console.log("Fullname is : ", this.state.value);
      // Retrieve the uploaded file to display
      const url = await Storage.get('image.jpg', { level: 'private' })
      this.setState({imageUrl: url})
      this.setState({loading: false})
      // logSingleItem();
    } catch (err) {
      console.log(err);
    }
  }
  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <label>Enter the name: </label>
          <input type="text" value={this.state.value} onChange={this.handleNewChange} />
        </form>
        <h1> Upload an Image </h1>
        {this.state.loading ? <h3>Uploading...</h3> : <input
          type="file" accept='image/jpg'
          onChange={(evt) => this.handleChange(evt)}
        />}
        <div>
          {this.state.imageUrl ? <img style={{ width: "30rem" }} src={this.state.imageUrl} /> : <span />}
        </div>
        <div>
          <h2>Download URL?</h2>
          <button onClick={() => this.state.downloadUrl()}>Click Here!</button>
        </div>
        
      </div>
    );
  }
  
}

// withAuthenticator wraps your App with a Login component
export default withAuthenticator(App);
