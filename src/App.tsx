import { Route, Routes } from 'react-router-dom';

import PublicLayout from './components/PublicLayout';

import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Technologies from './pages/Technologies';
import Journey from './pages/Journey';
import Studies from './pages/Studies';
import Certificates from './pages/Certificates';
import Content from './pages/Content';
import PostDetails from './pages/PostDetails';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/sobre" element={<About />} />

        <Route path="/projetos" element={<Projects />} />
        <Route path="/projetos/:slug" element={<ProjectDetails />} />

        <Route path="/tecnologias" element={<Technologies />} />

        <Route path="/jornada" element={<Journey />} />

        <Route path="/estudos" element={<Studies />} />

        <Route path="/certificados" element={<Certificates />} />

        <Route path="/conteudos" element={<Content />} />
        <Route path="/conteudos/:slug" element={<PostDetails />} />

        <Route path="/galeria" element={<Gallery />} />

        <Route path="/servicos" element={<Services />} />

        <Route path="/contato" element={<Contact />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}