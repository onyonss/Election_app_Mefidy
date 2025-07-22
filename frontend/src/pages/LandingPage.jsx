import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import votingIllustration from '../assets/voting-illustration.png';
import registerIllustration from '../assets/register-illustration.png';
import fingerprintIllustration from '../assets/shield-icon.png';

const taglines = [
  'Votez en Toute Sécurité',
  'Votre Voix, Votre Choix',
  'Élections Simples et Sûres'
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [taglineIndex, setTaglineIndex] = React.useState(0);
  const [fadeOut, setFadeOut] = React.useState(false);
  const [refServices, inViewServices] = useInView({ triggerOnce: true });
  const [refSteps, inViewSteps] = useInView({ triggerOnce: true });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartVoting = () => {
    setFadeOut(true);
    setTimeout(() => navigate('/connexion'), 400);
  };

  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
    viewport: { once: true }
  });

  return (
    <div
      className={`min-h-screen bg-white text-black transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ fontFamily: 'Arial Rounded MT', width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}
    >
      {/* Hero Section */}
      <section className="py-5" style={{ backgroundColor: '#f1f5ff' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <motion.div {...fadeIn()}>
                <h1 className="display-4 fw-bold">
                  Mefidy<br />
                  <span className="text-primary">{taglines[taglineIndex]}</span>
                </h1>
                <p className="lead text-muted mt-3">
                  Plateforme universitaire de vote ultra-sécurisée avec empreinte digitale.
                </p>
                <Button
                  variant="primary"
                  className="rounded-pill px-4 py-2 mt-3 shadow"
                  onClick={handleStartVoting}
                >
                  Votez Maintenant
                </Button>
              </motion.div>
            </Col>
            <Col md={6} className="text-center mt-4 mt-md-0">
              <motion.img
                src={fingerprintIllustration}
                alt="Fingerprint"
                className="img-fluid"
                style={{ maxHeight: '280px' }}
                {...fadeIn(0.3)}
                onError={() => console.error('Failed to load fingerprintIllustration')}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="py-5 bg-light" ref={refServices}>
        <Container>
          <motion.div className="text-center mb-5" {...fadeIn()}>
            <h2 className="fw-bold text-primary">Nos Services</h2>
            <p className="text-muted">Des outils puissants pour des élections sécurisées.</p>
          </motion.div>
          <Row className="g-4">
            {[
              {
                title: 'Gestion des Élections',
                desc: 'Planifiez et gérez vos élections facilement.'
              },
              {
                title: 'Tableau de Bord',
                desc: 'Suivez les votes en temps réel.'
              },
              {
                title: 'Vérification Biométrique',
                desc: 'Authentification via empreinte digitale.'
              },
              {
                title: 'Résultats Instantanés',
                desc: 'Affichage immédiat des résultats.'
              }
            ].map((s, i) => (
              <Col md={6} key={i}>
                <motion.div {...fadeIn(i * 0.2)}>
                  <Card className="shadow-sm h-100 border-0 rounded-4">
                    <Card.Body>
                      <h5 className="fw-bold text-primary mb-2">{s.title}</h5>
                      <p className="text-muted small">{s.desc}</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Vote Steps Section */}
      <section id="vote-steps" className="py-5" style={{ backgroundColor: '#e6f0ff' }} ref={refSteps}>
        <Container>
          <motion.div className="text-center mb-5" {...fadeIn()}>
            <h2 className="fw-bold text-primary">Votre Parcours de Vote</h2>
            <p className="text-muted">3 étapes faciles pour exercer votre droit.</p>
          </motion.div>
          <Row className="g-4">
            {[
              {
                title: 'Inscription',
                desc: 'Créez votre compte universitaire.',
                img: registerIllustration
              },
              {
                title: 'Vérification',
                desc: 'Confirmez votre identité avec une empreinte.',
                img: fingerprintIllustration
              },
              {
                title: 'Vote',
                desc: 'Exprimez votre choix en toute confidentialité.',
                img: votingIllustration
              }
            ].map((step, i) => (
              <Col md={4} key={i}>
                <motion.div {...fadeIn(i * 0.3)}>
                  <Card className="text-center border-0 shadow-sm rounded-4 h-100">
                    <Card.Body>
                      <img src={step.img} alt={step.title} style={{ maxHeight: '80px' }} className="mb-3" />
                      <h5 className="fw-bold text-primary">{step.title}</h5>
                      <p className="text-muted small">{step.desc}</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <img
                  src="/src/assets/REALWHITE.png"
                  alt="Mefidy Logo"
                  style={{
                    height: '50px',
                    marginRight: '15px',
                    transition: 'transform 0.3s ease',
                    cursor: 'default'
                  }}
                  className="logo-hover"
                />
                <div>
                  <h4 className="fw-bold mb-1">Mefidy</h4>
                  <p className="small text-white-50">Plateforme de vote universitaire sécurisée.</p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <h6 className="fw-bold mb-3">Liens Utiles</h6>
              <ul className="list-unstyled small">
                <li key="services"><a href="#services" className="text-white text-decoration-none">Services</a></li>
                <li key="vote-steps"><a href="#vote-steps" className="text-white text-decoration-none">Parcours de vote</a></li>
                <li key="connexion"><Link to="/connexion" className="text-white text-decoration-none">Connexion</Link></li>
              </ul>
            </Col>
          </Row>
          <div className="text-center text-white-50 small mt-3">© 2025 Mefidy. Tous droits réservés.</div>
        </Container>
      </footer>

      {/* Inline CSS for smooth scrolling, hidden scrollbars, and full-screen layout */}
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            width: 100vw;
            min-height: 100vh;
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          html {
            scroll-behavior: smooth;
          }
          section {
            width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
          }
          .min-h-screen {
            min-height: 100vh;
            width: 100vw;
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;