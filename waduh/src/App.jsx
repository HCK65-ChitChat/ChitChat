import './App.css';
import { useRef, useState } from 'react';



import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import PropTypes from 'prop-types';

import googleLogo from './image/icons8-google-48.png'

firebase.initializeApp({
  apiKey: "AIzaSyARTQl5N8Jftn1k8-fsYpaEu9ibqtu2-e0",
  authDomain: "chitchat-1a6e7.firebaseapp.com",
  projectId: "chitchat-1a6e7",
  storageBucket: "chitchat-1a6e7.appspot.com",
  messagingSenderId: "424751008989",
  appId: "1:424751008989:web:c86d5cbd7cdb36ad0adf34",
  measurementId: "G-BJG143DT70"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1> ChitChat💬</h1>

        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <h1 className="header">ChitChat💬</h1>
      <button className="sign-in" onClick={signInWithGoogle}>
        <img src={googleLogo} alt="Google Sign-In" />
        Sign in with Google
      </button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
  <>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {uid === auth.currentUser.uid && (
          <div>
            <span className="icon-button" onClick>
              <i className="material-icons">edit</i>
            </span>
            <span className="icon-button" onClick>
              <i className="material-icons">delete</i>
            </span>
          </div>
        )}
        {text && <p style={{ marginLeft: '10px' }}>{text}</p>}
        {props.message.imageUrl && <img src={props.message.imageUrl} alt="Sent Image" />}
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    imageUrl: PropTypes.string
  }).isRequired
};

export default App;