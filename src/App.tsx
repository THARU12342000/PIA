import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InteractionList from './components/InteractionList';
import InteractionDetail from './components/InteractionDetail';
import CreateInteraction from './components/CreateInteraction';
import EditInteraction from './components/EditInteraction';
import { Toaster } from './components/ui/Toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interactions" element={<InteractionList />} />
            <Route path="/interactions/:id" element={<InteractionDetail />} />
            <Route path="/interactions/:id/edit" element={<EditInteraction />} />
            <Route path="/create" element={<CreateInteraction />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;