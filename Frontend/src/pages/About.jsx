

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-hero-badge">Est. 2015</span>
          <h1>About <span className="highlight">TravelKro</span></h1>
          <p>Crafting unforgettable journeys for over a decade — your trusted travel companion.</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-story-section">
        <div className="about-story-container">
          <div className="about-story-text">
            <h2>Our <span className="highlight">Story</span></h2>
            <p>
              Founded in 2015, TravelKro began with a simple yet powerful vision — to make world-class travel 
              accessible to everyone. What started as a small team of passionate globetrotters has grown into 
              one of the most trusted travel platforms, serving over 12,000 happy travelers across the globe.
            </p>
            <p>
              We believe travel is more than just visiting places — it's about immersing yourself in new cultures, 
              creating lasting memories, and discovering the beauty of our diverse world. Every itinerary we craft 
              is a testament to our commitment to excellence, personalization, and authentic experiences.
            </p>
          </div>
          <div className="about-story-image">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" 
              alt="Travelers on a scenic road trip" 
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="about-stats-bar">
        <div className="about-stat-item">
          <h3>12K+</h3>
          <p>Happy Travelers</p>
        </div>
        <div className="about-stat-item">
          <h3>10+</h3>
          <p>Years Experience</p>
        </div>
        <div className="about-stat-item">
          <h3>100+</h3>
          <p>Destinations</p>
        </div>
        <div className="about-stat-item">
          <h3>50+</h3>
          <p>Expert Guides</p>
        </div>
        <div className="about-stat-item">
          <h3>98%</h3>
          <p>Satisfaction Rate</p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="about-mission-section">
        <div className="about-mission-header">
          <h2>Our <span className="highlight">Mission & Values</span></h2>
          <p>The principles that guide every journey we create.</p>
        </div>
        <div className="about-values-grid">
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-compass-3-line"></i>
            </div>
            <h3>Authentic Experiences</h3>
            <p>We go beyond typical tourist traps to connect you with the real heart and soul of every destination.</p>
          </div>
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-shield-check-line"></i>
            </div>
            <h3>Trust & Safety</h3>
            <p>Your safety is our priority. Every partner, hotel, and activity is vetted to meet our rigorous quality standards.</p>
          </div>
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-heart-3-line"></i>
            </div>
            <h3>Personalized Care</h3>
            <p>No two travelers are alike. We tailor every itinerary to match your unique preferences and travel style.</p>
          </div>
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-leaf-line"></i>
            </div>
            <h3>Sustainable Travel</h3>
            <p>We partner with eco-conscious providers and promote responsible tourism to protect the planet for future explorers.</p>
          </div>
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-customer-service-2-line"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Our dedicated team is available around the clock — because great travel support never sleeps.</p>
          </div>
          <div className="about-value-card">
            <div className="about-value-icon">
              <i className="ri-money-dollar-circle-line"></i>
            </div>
            <h3>Best Value Guarantee</h3>
            <p>Enjoy premium travel experiences at competitive prices. We negotiate the best deals so you don't have to.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why-section">
        <div className="about-why-container">
          <div className="about-why-image">
            <img 
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80" 
              alt="Beautiful travel destination" 
            />
          </div>
          <div className="about-why-text">
            <h2>Why Choose <span className="highlight">TravelKro?</span></h2>
            <div className="about-why-list">
              <div className="about-why-item">
                <i className="ri-check-double-line"></i>
                <div>
                  <h4>Handpicked Destinations</h4>
                  <p>Every destination in our catalog is personally visited and verified by our expert travel team.</p>
                </div>
              </div>
              <div className="about-why-item">
                <i className="ri-check-double-line"></i>
                <div>
                  <h4>Flexible Booking</h4>
                  <p>Free cancellation up to 48 hours before your trip. Change plans? No problem.</p>
                </div>
              </div>
              <div className="about-why-item">
                <i className="ri-check-double-line"></i>
                <div>
                  <h4>Local Expert Guides</h4>
                  <p>Connect with passionate local guides who share insider knowledge and hidden gems.</p>
                </div>
              </div>
              <div className="about-why-item">
                <i className="ri-check-double-line"></i>
                <div>
                  <h4>Seamless Experience</h4>
                  <p>From booking to boarding, we handle every detail so you can focus on enjoying the journey.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
