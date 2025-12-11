import { useRef, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Shield, Zap, Globe as GlobeIcon, Code, Heart, Hammer } from 'lucide-react';
import logo from '../assets/sentinelforge-logo.png'
import './HomePage.css'

function RotatingGlobe() {
  const meshRef = useRef()
  const glowRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.003
    }
  })

  // Load Earth texture map
  const earthTexture = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
  )

  return (
    <group>
      {/* Main Earth sphere with realistic texture - rotated to show North America */}
      <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Cyan/blue wireframe grid - cleaner, less dense */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.02, 24, 12]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe={true}
          transparent={true}
          opacity={0.12}
        />
      </mesh>

      {/* Magenta/pink wireframe grid - very subtle accent */}
      <mesh>
        <sphereGeometry args={[2.025, 16, 8]} />
        <meshBasicMaterial
          color="#ff00ff"
          wireframe={true}
          transparent={true}
          opacity={0.08}
        />
      </mesh>

      {/* Very subtle outer glow - minimal haze */}
      <mesh>
        <sphereGeometry args={[2.12, 32, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent={true}
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section with Globe */}
      <section className="hero-section" aria-label="Hero section">
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-logo">
              <img src={logo} alt="SentinelForge CTF Logo" style={{ width: '200px', marginBottom: '1rem' }} />
            </div>
            <h1 className="hero-title">
              <span className="text-glow-cyan">SENTINELFORGE</span>{' '}
              <span className="text-glow-magenta">CTF</span>
            </h1>
            <p className="hero-subtitle">
              Forge through challenges to bolster your cybersecurity skills
            </p>
            <p className="hero-description">
              Self-hosted CTF platform to learn about modern and secure ways to build cloud infrastructure, containers, DevSecOps, and more.
              Deploy in minutes with Docker. Train your team your way.
            </p>
            
            <div className="hero-stats" role="list" aria-label="Platform statistics">
              <div className="stat-card" role="listitem" title="Curated challenge packs for targeted skill development">
                <GlobeIcon size={32} className="stat-icon" aria-hidden="true" />
                <div className="stat-value">Challenge Packs</div>
                <p className="stat-description">Focus on what matters most to you with curated challenge collections</p>
              </div>
              <div className="stat-card" role="listitem" title="Fully open-source platform that you can tailor for your needs">
                <Shield size={32} className="stat-icon" aria-hidden="true" />
                <div className="stat-value">Open Source</div>
                <p className="stat-description">Fully open-source platform that is backed by a strong community</p>
              </div>
              <div className="stat-card" role="listitem" title="Designed for technology builders and implementors">
                <Hammer size={32} className="stat-icon" aria-hidden="true" />
                <div className="stat-value">Builder-Focused</div>
                <p className="stat-description">Designed for technology builders and implementors</p>
              </div>
              <div className="stat-card" role="listitem" title="Host in your own environment to manage on your terms">
                <Zap size={32} className="stat-icon" aria-hidden="true" />
                <div className="stat-value">Self-Hostable</div>
                <p className="stat-description">Host in your own environment to manage on your terms</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="globe-container">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
                <Suspense fallback={null}>
                  <RotatingGlobe />
                </Suspense>
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                  autoRotate
                  autoRotateSpeed={0.8}
                />
              </Canvas>
            </div>
            
            <div className="globe-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why <span className="text-glow-cyan">SentinelForge CTF</span>?
        </motion.h2>
        
        <motion.div 
          className="features-narrative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="narrative-text">
            Most CTF platforms emphasize traditional ethical hacking skills like password cracking or malware analysis. 
            While valuable, these exercises rarely reflect the daily challenges faced by modern technology professionals.
          </p>
          <p className="narrative-text">
            <strong>SentinelForge is different.</strong>
          </p>
          <p className="narrative-text">
            We're a <span className="text-glow-cyan">community-driven platform</span> built for the builders and implementors — 
            cloud architects, DevOps engineers, platform teams, and security practitioners who design, deploy, and secure today's infrastructure.
          </p>
          <p className="narrative-text">
            <strong>Our focus: real-world scenarios.</strong>
          </p>
          <p className="narrative-text">
            Excellence starts with mastering fundamentals. Our challenges center on practical issues such as 
            misconfigured cloud IAM policies, vulnerable container images, insecure CI/CD pipelines, and Infrastructure-as-Code misconfigurations. 
            We believe the best way to learn is through <span className="text-glow-magenta">hands-on experience</span> with the tools you use every day.
          </p>
          <p className="narrative-text">
            Whether you're hardening Kubernetes clusters, reviewing Terraform modules, or securing deployment pipelines, 
            SentinelForge delivers training that translates directly to your work.
          </p>
          <p className="narrative-text">
            This isn't about marketing and selling another CTF product — it's about providing an open platform where professionals of all skill levels 
            can level up their expertise, share unique challenges, and exchange tips with a vibrant community. We empower you to jump in, contribute, 
            and grow alongside others who are passionate about building secure systems.
          </p>
        </motion.div>
      </section>

      {/* Contribution Section */}
      <section className="contribution-section">
        <motion.div 
          className="contribution-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            Support <span className="text-glow-cyan">SentinelForge</span>
          </h2>
          <p className="contribution-description">
            SentinelForge is open source and free for everyone. Help us grow by contributing or purchasing premium content!
          </p>
          
          <div className="contribution-options">
            <motion.a
              href="https://ko-fi.com/sentinelforgectf"
              target="_blank"
              rel="noopener noreferrer"
              className="contribution-card neon-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlobeIcon size={48} className="contribution-icon" />
              <h3>Challenge Packs</h3>
              <p>Purchase curated challenge collections for Azure, AWS, Kubernetes, and more</p>
              <span className="contribution-link">Browse Challenge Packs →</span>
            </motion.a>

            <motion.a
              href="https://github.com/chadeckles/sentinelforgectf"
              target="_blank"
              rel="noopener noreferrer"
              className="contribution-card neon-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Code size={48} className="contribution-icon" />
              <h3>Contribute Code</h3>
              <p>Submit PRs, fix bugs, add challenges, or improve documentation on GitHub</p>
              <span className="contribution-link">View on GitHub →</span>
            </motion.a>

            <motion.a
              href="https://ko-fi.com/sentinelforgectf"
              target="_blank"
              rel="noopener noreferrer"
              className="contribution-card neon-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart size={48} className="contribution-icon" />
              <h3>Support via Ko-Fi</h3>
              <p>Support infrastructure costs and help keep the platform running 24/7</p>
              <span className="contribution-link">Buy us a coffee →</span>
            </motion.a>

            <motion.a
              href="mailto:sponsors@sentinelforgectf.io"
              className="contribution-card neon-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Hammer size={48} className="contribution-icon" />
              <h3>Corporate Sponsorship</h3>
              <p>Interested in sponsoring challenges or features? Let's talk!</p>
              <span className="contribution-link">Contact us →</span>
            </motion.a>
          </div>

          <p className="contribution-footer">
            Platform is free forever. We monetize through premium challenge content, not platform licensing.
          </p>
        </motion.div>
      </section>
    </div>
  )
}

export default HomePage
