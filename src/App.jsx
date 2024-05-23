import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import './App.css'

function App() {
  const lastNoteRef = useRef(null);
  const randNum = Math.floor(Math.random() * 90000) + 10000;
  const groupColors = ['#B38BFA', '#FF79F2', '#43E6FC', '#F19576', '#0047FF', '#6691FF'];

  const [groupError, setGroupError] = useState({ success: true, msg: '' });
  const [groupInfo, setGroupInfo] = useState({ name: '', color: '', id: randNum });
  const [allGroup, setAllGroup] = useState(JSON.parse(localStorage.getItem('allGroup')) ?? []);

  const [notesError, setNotesError] = useState(false);
  const [notes, setNotes] = useState([]);
  const [oneNote, setOneNote] = useState({ id: '', note: '', datetime: '' });
  const [allNotes, setAllNotes] = useState(JSON.parse(localStorage.getItem('allNotes')) ?? []);

  const [activeGroup, setActiveGroup] = useState(null);
  const [smallerScreen, handleSmallerScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modal, setModal] = useState(null);

  function openModal() {
    if (modal) modal.show();
    setGroupError({ success: true, msg: '' });
  }

  function createGroup() {
    setGroupError({ success: true, msg: "" });
    if (!groupInfo.name || !groupInfo.color) {
      setGroupError({ success: false, msg: "Both group name and color are required." });
      return;
    } else {
      setGroupInfo({ name: '', color: '', id: randNum });
      setAllGroup(prevGroups => [...prevGroups, groupInfo]);
      if (modal) modal.hide();
    }
  }

  function createNote() {
    setNotesError(false); scrollToLastNote();
    setAllNotes(prevNotes => [...prevNotes, oneNote]);
    setNotes(prevNotes => ({ ...prevNotes, notesData: [...notes.notesData, oneNote] }));
    setOneNote(prevNote => ({ ...prevNote, note: '' }));
  }

  function fetchNotes(id) {
    handleSmallerScreen(true); setActiveGroup(id); scrollToLastNote();
    setOneNote(prevNote => ({ ...prevNote, note: '' }));
    const allGroups = JSON.parse(localStorage.getItem('allGroup'));
    const allNotes = JSON.parse(localStorage.getItem('allNotes'));

    const matchingGroup = allGroups.find(group => group.id === id);
    const matchingNote = allNotes.filter(note => note.id === id);

    if (matchingGroup && matchingNote) {
      setNotes({ groupData: matchingGroup, notesData: matchingNote });
    } else {
      console.log(`No group found with id ${id}`);
    }
  }

  function getInitials(name) {
    const words = name.split(' ');
    if (words.length > 1) {
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    } else {
      return name.charAt(0).toUpperCase();
    }
  }

  function scrollToLastNote() {
    setTimeout(() => {
      if (lastNoteRef.current) {
        lastNoteRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 30);
  }

  useEffect(() => {
    localStorage.setItem('allGroup', JSON.stringify(allGroup));
    localStorage.setItem('allNotes', JSON.stringify(allNotes));
  }, [allGroup, allNotes]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const modalElement = document.getElementById('group-modal');
    const modalInstance = new bootstrap.Modal(modalElement);
    setModal(modalInstance);
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className={`col-md-3 position-fixed top-0 start-0 vh-100 overflow-y-auto p-0 ${smallerScreen ? 'd-none' : ''} d-md-block`}>
          <h2 className="sticky-top bg-white text-center py-4">Pocket Notes</h2>
          <ul className="d-flex flex-column p-0">
            {allGroup && allGroup.map((group, key) => (
              <li className={`notes-group d-flex align-items-center gap-3 fw-medium rounded-4 ${group.id === activeGroup && 'group-active'} p-3 px-4`} key={key} role="button" onClick={() => fetchNotes(group.id)}>
                <button className="group-button d-flex justify-content-center align-items-center text-white rounded-circle border-0 fs-5" style={{ background: group.color }}>{getInitials(group.name)}</button><span>{group.name}</span>
              </li>
            ))}
          </ul>
          <div className={`create-notes position-fixed bottom-0 start-0 ${isMobile ? 'w-100' : 'w-25'}`} onClick={() => openModal()}>
            <div className="position-relative">
              <button className="d-flex justify-content-center align-items-center rounded-circle bg-dark-blue border-0 position-absolute bottom-0 end-0 m-4">
                <img src="/images/plus.png" alt="" />
              </button>
            </div>
          </div>
        </div>
        <div className={`col-md-9 offset-md-3 position-relative min-vh-100 notes-panel p-0 ${smallerScreen ? '' : 'd-none'} d-md-block`}>
          {notes.length !== 0 ? (
            <div>
              <nav className="d-flex align-items-center gap-3 sticky-top bg-dark-blue text-white fw-medium fs-5 p-3">
                <img className="d-block d-md-none" onClick={() => handleSmallerScreen(false)} src="/images/back.png" role="button" alt="" />
                <span className="group-button d-flex justify-content-center align-items-center text-white rounded-circle border-0 fs-5" style={{ background: notes.groupData.color }}>{getInitials(notes.groupData.name)}</span><span>{notes.groupData.name}</span>
              </nav>
              <main>
                {notes.notesData.map((note, key) => (
                  <div className="card shadow m-4" key={key}>
                    <div className="card-body fw-medium">
                      <p>{note.note}</p>
                      <span className="float-end">{note.datetime}</span>
                    </div>
                  </div>
                ))}
                <div ref={lastNoteRef}></div>
              </main>
              <footer className={`bg-dark-blue position-fixed bottom-0 end-0 ${isMobile ? 'w-100' : 'w-75'} p-3`}>
                <div className="position-relative">
                  <textarea className="form-control" rows={5} value={oneNote.note} onInput={(e) => {
                    setOneNote({ id: notes.groupData.id, note: e.target.value, datetime: moment().format('D MMM YYYY • h:mm A') });
                    setNotesError(e.target.value.trim().length === 0 ? false : true);
                  }} placeholder='Enter your text here...'></textarea>
                  <img className="position-absolute bottom-0 end-0 m-3" role="button" src={`/images/send-${notesError ? 'solid' : 'light'}.png`} alt="" onClick={() => notesError && createNote()} />
                </div>
              </footer>
            </div>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
              <img src="/images/hero.png" width={400} alt="" />
              <h2 className="my-3">Pocket Notes</h2>
              <p className="fw-medium">Send and receive messages without keeping your phone online.<br />Use Pocket Notes on up to 4 linked devices and 1 mobile phone.</p>
              <p className="position-absolute bottom-0 start-50 translate-middle-x">
                <img className="lock-icon" src="/images/lock.png" alt="" />
                <span className="ms-1">end-to-end encrypted</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="modal fade" id="group-modal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <h5>Create New Group</h5>
              <div className="row g-3 align-items-center my-1">
                <div className="col-auto">
                  <label className="col-form-label fw-medium">Group Name</label>
                </div>
                <div className="col">
                  <input className="form-control rounded-pill " type="text" value={groupInfo.name} onInput={(e) => setGroupInfo({ ...groupInfo, name: e.target.value })} placeholder='Enter group name' />
                </div>
              </div>
              <div className="row g-3 align-items-center my-1">
                <div className="col-auto">
                  <label className="col-form-label fw-medium">Choose Colour</label>
                </div>
                <div className="col-auto d-flex gap-2">
                  {groupColors.map((color, key) => (
                    <button className="group-color btn rounded-circle" style={{ background: color }} onClick={() => setGroupInfo({ ...groupInfo, color: color })} key={key}></button>
                  ))}
                </div>
              </div>
              {groupError.msg && (<p className={`text-${groupError.success ? 'success' : 'danger'} fw-medium mt-3`}>{groupError.msg}</p>)}
              <span className="bg-dark-blue text-white rounded-1 float-end px-5 py-1 mt-3" role="button" onClick={() => createGroup()}>Create</span>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default App