/*
import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo , useState,useEffect} from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const [username,setUsername] = useState(()=>{
  return new URLSearchParams(window.location.search).get("username") || ""
  })

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
 
  };

  const handleJoin =()=>{
   e.preventDefault()
   setUsername(e.target.username.value)
   window.history.pushState({},"","?username="+ e.target.username.value)
  }

  useEffect(()=>{
   if(username && editorRef.current){
    const provider = useMemo(() => {
    return new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      }
    );
  }, [ydoc]);

  provider.awareness.setLocalStateField("user",{username})
  provider.awareness.on("change",()=>{
    const states = Array.from(provider.awarenes.getStates().values())
    setUsers(states.map(state=>state.user).filter(user => Booleon(user.username)))
  })

  function handleBeforeUnload(){
    provider.awareness.setLocalStateField("user",null);
  }
  window.addEventListener("beforeunload", handleBeforeUnload)

     new MonacoBinding(
      yText,
      editor.current.getModel(),
      new Set([editorRef]),
      provider.awareness
    );
   }
  },[
    editorRef.current,
    username
  ])

  return ()=>{
    monacoBinding.destroy(),
    provider.disconnect()
    window.removeEventListener("beforeunload", handleBeforeUnload)
  }

  if(!username){
    return(
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form
        onSubmit={handleJoin}
        className="flex flex-col gap-4">
          <input 
          type="text"
          placeholder="enter username"
          className="p-2 rounded-lg bg-gray-800 text-white"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          
          />

          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
              Join
          </button>
        </form>
  
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        Sidebar
      </aside>

      <section className="w-3/4 h-full bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
*/

import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);

  // This username means the user has actually joined
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  // This is only for typing in the input
  const [inputUsername, setInputUsername] = useState("");

  // Store editor after Monaco has mounted
  const [editor, setEditor] = useState(null);

  // Store connected users
  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => {
    return ydoc.getText("monaco");
  }, [ydoc]);

  // Create provider once
  const provider = useMemo(() => {
    return new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      }
    );
  }, [ydoc]);

  const handleMount = (editorInstance) => {
    editorRef.current = editorInstance;
    setEditor(editorInstance);
  };

  const handleJoin = (e) => {
    e.preventDefault();

    const trimmedUsername = inputUsername.trim();

    // Don't allow empty username
    if (!trimmedUsername) {
      return;
    }

    // User officially joins here
    setUsername(trimmedUsername);

    window.history.pushState(
      {},
      "",
      "?username=" + encodeURIComponent(trimmedUsername)
    );
  };

  useEffect(() => {
    // Wait until both username and Monaco editor exist
    if (!username || !editor) {
      return;
    }

    // Set current user information
    provider.awareness.setLocalStateField("user", {
      username,
    });

    // Get connected users
    const handleAwarenessChange = () => {
      const states = Array.from(
        provider.awareness.getStates().values()
      );

      const activeUsers = states
        .map((state) => state.user)
        .filter((user) => Boolean(user?.username));

      setUsers(activeUsers);
    };

    provider.awareness.on("change", handleAwarenessChange);

    // Create Monaco collaboration binding
    const monacoBinding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Remove user before closing page
    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    // Cleanup
    return () => {
      monacoBinding.destroy();

      provider.awareness.off(
        "change",
        handleAwarenessChange
      );

      provider.awareness.setLocalStateField(
        "user",
        null
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [username, editor, provider, yText]);

  // Username Join Screen
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="enter username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            value={inputUsername}
            onChange={(e) =>
              setInputUsername(e.target.value)
            }
          />

          <button
            type="submit"
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  // Main Editor Screen
  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-4">
          Connected Users
        </h2>

        <div className="flex flex-col gap-2">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div
                key={index}
                className="bg-gray-200 p-2 rounded"
              >
                {user.username}
              </div>
            ))
          ) : (
            <p>No users connected</p>
          )}
        </div>
      </aside>

      <section className="w-3/4 h-full bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;