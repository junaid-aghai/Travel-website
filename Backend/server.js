require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'travelkro_secret_key_123';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOption = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = process.env.DB_NAME || 'TravelWebpage';

let db;

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);

    // Auto-seed if empty
    const collection = db.collection('destinations');
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log('Database empty, seeding sample destinations...');
      const sampleDestinations = [
        {
          location: 'Bali, Indonesia',
          desc: 'Ancient temples, lush green rice terraces & tropical sun-kissed beaches.',
          rating: 4.9,
          reviews: 3420,
          price: 1299,
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Arrival & Seminyak Beach', description: 'Arrive at Ngurah Rai airport, transfer to your beachfront resort. Spend the afternoon relaxing at Seminyak Beach and enjoy a sunset dinner.', highlights: ['Airport pickup', 'Beach resort check-in', 'Sunset dinner at beach club'] },
            { day: 2, title: 'Ubud Temple & Rice Terraces', description: 'Visit the sacred Tirta Empul temple, explore the stunning Tegallalang rice terraces, and discover local artisan workshops.', highlights: ['Tirta Empul temple visit', 'Tegallalang rice terraces', 'Art village tour'] },
            { day: 3, title: 'Mount Batur Sunrise Trek', description: 'Early morning hike to the summit of Mount Batur for a breathtaking sunrise. Afternoon at Kintamani with lake views and hot springs.', highlights: ['Sunrise trekking', 'Volcanic hot springs', 'Kintamani lake panorama'] },
            { day: 4, title: 'Nusa Penida Island Day Trip', description: 'Speedboat to Nusa Penida island. Visit the iconic Kelingking Beach cliff, snorkel with manta rays, and explore Angel Billabong.', highlights: ['Kelingking Beach', 'Manta ray snorkeling', 'Angel Billabong natural pool'] },
            { day: 5, title: 'Spa Day & Departure', description: 'Morning Balinese spa treatment, shopping at local markets, and transfer to airport for departure.', highlights: ['Traditional Balinese spa', 'Souvenir shopping', 'Airport transfer'] }
          ]
        },
        {
          location: 'Paris, France',
          desc: 'The City of Light, romance, world-class art, and the iconic Eiffel Tower.',
          rating: 4.8,
          reviews: 2850,
          price: 1599,
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Eiffel Tower & Seine Cruise', description: 'Begin with the iconic Eiffel Tower, enjoy panoramic city views, followed by a romantic Seine River cruise at sunset.', highlights: ['Eiffel Tower summit', 'Seine River cruise', 'Trocadéro gardens'] },
            { day: 2, title: 'Louvre & Montmartre', description: 'Explore the world-famous Louvre Museum, then wander the artistic streets of Montmartre and visit Sacré-Cœur.', highlights: ['Mona Lisa at Louvre', 'Montmartre walking tour', 'Sacré-Cœur basilica'] },
            { day: 3, title: 'Versailles Palace Day Trip', description: 'Full-day excursion to the magnificent Palace of Versailles. Explore the Hall of Mirrors, royal apartments, and the stunning gardens.', highlights: ['Hall of Mirrors', 'Royal gardens', 'Marie Antoinette estate'] },
            { day: 4, title: 'Le Marais & French Cuisine', description: 'Explore the trendy Le Marais district, visit Notre-Dame area, and enjoy a French cooking class with a local chef.', highlights: ['Le Marais boutiques', 'Notre-Dame visit', 'French cooking class'] },
            { day: 5, title: 'Champs-Élysées & Departure', description: 'Morning stroll along the Champs-Élysées, Arc de Triomphe visit, last-minute shopping, and airport transfer.', highlights: ['Arc de Triomphe', 'Champs-Élysées shopping', 'Farewell brunch'] }
          ]
        },
        {
          location: 'Kyoto, Japan',
          desc: 'Historic shrines, blooming cherry blossoms & traditional serene tea houses.',
          rating: 4.9,
          reviews: 4120,
          price: 1799,
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Fushimi Inari & Gion District', description: 'Hike through thousands of vermillion torii gates at Fushimi Inari shrine, then explore the traditional Gion geisha district.', highlights: ['10,000 torii gates', 'Gion district walk', 'Traditional kaiseki dinner'] },
            { day: 2, title: 'Bamboo Grove & Golden Pavilion', description: 'Morning walk through the ethereal Arashiyama Bamboo Grove, visit Kinkaku-ji (Golden Pavilion), and enjoy a rickshaw ride.', highlights: ['Arashiyama Bamboo Grove', 'Kinkaku-ji temple', 'Rickshaw experience'] },
            { day: 3, title: 'Tea Ceremony & Zen Gardens', description: 'Participate in an authentic Japanese tea ceremony, visit the famous rock garden at Ryoan-ji, and explore Nijo Castle.', highlights: ['Tea ceremony experience', 'Ryoan-ji rock garden', 'Nijo Castle nightingale floors'] },
            { day: 4, title: 'Nara Day Trip', description: 'Day trip to Nara to see the friendly bowing deer, visit the massive Todai-ji temple housing the Great Buddha.', highlights: ['Nara deer park', 'Great Buddha statue', 'Kasuga Taisha shrine'] }
          ]
        },
        {
          location: 'Swiss Alps, Switzerland',
          desc: 'Majestic snow-capped peaks, alpine skiing & crystal-clear glacial lakes.',
          rating: 4.9,
          reviews: 1980,
          price: 2199,
          image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Arrival in Interlaken', description: 'Arrive in Interlaken, settle into your alpine chalet. Afternoon cruise on Lake Thun with mountain panorama views.', highlights: ['Alpine chalet check-in', 'Lake Thun cruise', 'Welcome fondue dinner'] },
            { day: 2, title: 'Jungfraujoch – Top of Europe', description: 'Train journey to Jungfraujoch, the highest railway station in Europe at 3,454m. Visit the Ice Palace and Sphinx Observatory.', highlights: ['Cogwheel railway', 'Ice Palace', 'Sphinx Observatory panorama'] },
            { day: 3, title: 'Lauterbrunnen Valley & Waterfalls', description: 'Explore the stunning Lauterbrunnen Valley with 72 waterfalls, visit Trümmelbach Falls inside the mountain, and cable car to Mürren.', highlights: ['72 waterfalls valley', 'Trümmelbach Falls', 'Mürren village views'] },
            { day: 4, title: 'Grindelwald Adventure Day', description: 'First Cliff Walk, gondola rides, paragliding over the Alps (optional), and hiking through wildflower meadows.', highlights: ['First Cliff Walk', 'Paragliding option', 'Alpine meadow hiking'] },
            { day: 5, title: 'Lake Brienz & Departure', description: 'Morning boat ride on turquoise Lake Brienz, visit Giessbach Falls, and transfer to airport.', highlights: ['Lake Brienz cruise', 'Giessbach Falls', 'Swiss chocolate tasting'] }
          ]
        },
        {
          location: 'Santorini, Greece',
          desc: 'Iconic whitewashed cliffside villas & stunning Aegean sea sunsets.',
          rating: 4.7,
          reviews: 3100,
          price: 1499,
          image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Oia Sunset & Caldera Views', description: 'Arrive in Santorini, check into your cliffside villa. Evening walk through Oia for the world-famous caldera sunset.', highlights: ['Cliffside villa check-in', 'Oia blue dome churches', 'Legendary sunset viewing'] },
            { day: 2, title: 'Catamaran Cruise & Hot Springs', description: 'Full-day catamaran cruise around the caldera, swim in volcanic hot springs, snorkel at Red Beach, and BBQ lunch on board.', highlights: ['Caldera sailing', 'Volcanic hot springs', 'Red Beach snorkeling'] },
            { day: 3, title: 'Wine Tasting & Akrotiri Ruins', description: 'Tour local wineries for Assyrtiko wine tasting, visit the ancient Minoan ruins of Akrotiri, explore Fira town.', highlights: ['Volcanic wine tasting', 'Akrotiri archaeological site', 'Fira town exploration'] },
            { day: 4, title: 'Beach Day & Departure', description: 'Morning at Kamari black sand beach, last shopping in Oia, and transfer to airport.', highlights: ['Kamari black sand beach', 'Souvenir shopping', 'Farewell Greek feast'] }
          ]
        },
        {
          location: 'Rome, Italy',
          desc: 'Ancient Colosseum, Vatican city architecture & mouth-watering Italian pasta.',
          rating: 4.8,
          reviews: 2940,
          price: 1399,
          image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Colosseum & Roman Forum', description: 'Skip-the-line tour of the Colosseum, explore the Roman Forum and Palatine Hill, evening stroll through Trastevere.', highlights: ['Colosseum guided tour', 'Roman Forum walk', 'Trastevere dinner'] },
            { day: 2, title: 'Vatican City & Sistine Chapel', description: 'Full Vatican experience — St. Peter\'s Basilica, climb the dome, Vatican Museums, and the magnificent Sistine Chapel.', highlights: ['St. Peter\'s Basilica dome', 'Sistine Chapel ceiling', 'Vatican Museums'] },
            { day: 3, title: 'Trevi Fountain & Spanish Steps', description: 'Toss a coin at Trevi Fountain, climb the Spanish Steps, visit the Pantheon, and enjoy authentic Italian gelato.', highlights: ['Trevi Fountain', 'Spanish Steps', 'Pantheon visit', 'Gelato tasting'] },
            { day: 4, title: 'Pasta Making & Departure', description: 'Morning pasta-making class with a Roman nonna, visit Borghese Gallery, and airport transfer.', highlights: ['Pasta making class', 'Borghese Gallery', 'Roman marketplace visit'] }
          ]
        },
        {
          location: 'Cairo, Egypt',
          desc: 'The Great Pyramids of Giza, mysterious Sphinx & sunset Nile cruises.',
          rating: 4.6,
          reviews: 1750,
          price: 1199,
          image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Pyramids of Giza & Sphinx', description: 'Visit the Great Pyramids of Giza, see the mysterious Sphinx up close, and enjoy an optional camel ride across the desert.', highlights: ['Great Pyramid entry', 'Sphinx photo opportunity', 'Camel ride in desert'] },
            { day: 2, title: 'Egyptian Museum & Khan el-Khalili', description: 'Explore the Egyptian Museum with Tutankhamun\'s treasures, then haggle at the vibrant Khan el-Khalili bazaar.', highlights: ['Tutankhamun gold mask', 'Ancient artifacts', 'Khan el-Khalili bazaar'] },
            { day: 3, title: 'Nile River Cruise', description: 'Full-day Nile cruise with stops at historic sites, belly dance entertainment, and traditional Egyptian feast on board.', highlights: ['Felucca sailing', 'Sunset on the Nile', 'Traditional Egyptian dinner'] },
            { day: 4, title: 'Saqqara & Memphis', description: 'Day trip to the Step Pyramid at Saqqara and the ancient capital Memphis. Visit the Alabaster Sphinx and colossal Ramses statue.', highlights: ['Step Pyramid of Djoser', 'Memphis open-air museum', 'Alabaster Sphinx'] }
          ]
        },
        {
          location: 'Maui, Hawaii',
          desc: 'Tropical paradise, crystal blue waters, waterfalls & volcanic hikes.',
          rating: 4.9,
          reviews: 2450,
          price: 1899,
          image: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=800&q=80',
          itinerary: [
            { day: 1, title: 'Arrival & Ka\'anapali Beach', description: 'Arrive in Maui, check into beachfront resort. Spend the afternoon snorkeling at Ka\'anapali Beach and enjoy a luau dinner.', highlights: ['Resort check-in', 'Ka\'anapali snorkeling', 'Traditional luau feast'] },
            { day: 2, title: 'Road to Hana', description: 'Drive the legendary Road to Hana — 620 curves, 59 bridges, countless waterfalls, and black sand beaches.', highlights: ['Twin Falls hike', 'Wai\'anapanapa black sand beach', 'Bamboo forest walk'] },
            { day: 3, title: 'Haleakalā Sunrise', description: 'Pre-dawn drive to Haleakalā summit (10,023 ft) for an unforgettable sunrise above the clouds. Afternoon whale watching.', highlights: ['Sunrise above clouds', 'Volcanic crater views', 'Whale watching cruise'] },
            { day: 4, title: 'Molokini Snorkeling & Departure', description: 'Morning boat trip to Molokini crater for world-class snorkeling in crystal-clear waters, then farewell beach time.', highlights: ['Molokini crater snorkeling', 'Sea turtle encounters', 'Farewell sunset'] }
          ]
        }
      ];
      await collection.insertMany(sampleDestinations);
      console.log('Sample data seeded successfully.');
    }

    // Auto-seed reviews collection if empty
    const reviewCol = db.collection('reviews');
    const reviewCount = await reviewCol.countDocuments();
    if (reviewCount === 0) {
      console.log('Seeding sample reviews into "reviews" collection...');
      const sampleReviews = [
        {
          name: 'Sophia Martinez',
          role: 'Adventure Enthusiast',
          destination: 'Bali, Indonesia',
          comment: 'TravelKro made our Bali vacation completely effortless! The curated temples and beach resorts were top-tier. Every detail was perfectly planned and executed smoothly.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        },
        {
          name: 'David Chen',
          role: 'Solo Explorer',
          destination: 'Kyoto, Japan',
          comment: 'Booking Kyoto through TravelKro was the best decision. Flawless support and incredible prices! Wandering through bamboo groves and ancient shrines was unforgettable.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        },
        {
          name: 'Emma & Liam Wilson',
          role: 'Honeymooners',
          destination: 'Santorini, Greece',
          comment: 'Santorini was an absolute dream! The sunset recommendations and cliffside hotel arrangements exceeded all our expectations. Truly magical experience for our honeymoon.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        },
        {
          name: 'Arjun Patel',
          role: 'Family Traveler',
          destination: 'Swiss Alps, Switzerland',
          comment: 'We took our kids on a trip to Switzerland and TravelKro handled everything — scenic train rides, cozy chalets, and ski passes. The kids had the time of their lives!',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        },
        {
          name: 'Maria Gonzalez',
          role: 'Cultural Explorer',
          destination: 'Machu Picchu, Peru',
          comment: 'From the ancient ruins of Machu Picchu to the vibrant culinary scene in Lima, TravelKro curated the perfect cultural immersion trip for me.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        },
        {
          name: 'Lucas Rossi',
          role: 'Backpacker & Photographer',
          destination: 'Amalfi Coast, Italy',
          comment: 'The photography tour along the Amalfi coast was spectacular. TravelKro gave us local tips for secret viewpoints that tourists rarely find!',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          storyImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date()
        }
      ];
      await reviewCol.insertMany(sampleReviews);
      console.log('Sample reviews seeded into "reviews" collection successfully.');
    }
  } catch (err) {
    console.error('MongoDB init error:', err);
  }
}

initDB();

const checkDb = (req, res, next) => {
  if (!db) {
    return res.status(503).json({ success: false, message: 'Database connecting, please try again shortly.' });
  }
  next();
};

app.use(checkDb);

app.get('/national', async (req, res) => {
  try {
    const collection = db.collection('destinations');
    const destination = await collection.find().toArray();
    res.json({ destination });
  } catch (err) {
    console.error('Fetch destinations error:', err);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

app.get('/topdest', async (req, res) => {
  try {
    const collection = db.collection('destinations');
    const destination = await collection.find().limit(4).toArray();
    res.json({ destination });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top destinations' });
  }
});

app.post('/submit', async (req, res) => {
  try {
    const collection = db.collection('destinations');
    const newDestination = req.body;
    // ensure numeric values if provided
    if (newDestination.price !== undefined) newDestination.price = Number(newDestination.price) || 0;
    if (newDestination.rating !== undefined) newDestination.rating = Number(newDestination.rating) || 4.8;
    if (newDestination.reviews !== undefined) newDestination.reviews = Number(newDestination.reviews) || 100;

    const result = await collection.insertOne(newDestination);
    res.status(201).json({ success: true, message: 'Destination added successfully!', id: result.insertedId, destination: { ...newDestination, _id: result.insertedId } });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to add destination' });
  }
});

app.get('/destination/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('destinations');
    let destination = null;
    if (ObjectId.isValid(id)) {
      try {
        destination = await collection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // invalid ObjectId representation
      }
    }
    if (!destination) {
      destination = await collection.findOne({ _id: id });
    }
    if (!destination) {
      destination = await collection.findOne({ location: decodeURIComponent(id) });
    }
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, destination });
  } catch (err) {
    console.error('Get destination error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch destination' });
  }
});

app.delete('/destination/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('destinations');

    let result = { deletedCount: 0 };
    if (ObjectId.isValid(id)) {
      try {
        result = await collection.deleteOne({ _id: new ObjectId(id) });
      } catch (e) {
        // invalid ObjectId
      }
    }
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ _id: id });
    }
    if (result.deletedCount === 0) {
      // Fallback try matching by location if id was string location
      result = await collection.deleteOne({ location: decodeURIComponent(id) });
    }

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (err) {
    console.error('Delete destination error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete destination' });
  }
});

app.post('/book', async (req, res) => {
  try {
    const collection = db.collection('bookings');
    const { destinationId, destinationName, userName, userEmail, persons, pricePerPerson, totalPrice, travelDate } = req.body;

    if (!destinationName || !userName || !userEmail || !persons || !pricePerPerson) {
      return res.status(400).json({ success: false, message: 'All booking fields are required' });
    }

    const numPersons = Number(persons) || 1;
    const numPricePerPerson = Number(pricePerPerson) || 0;
    const numTotalPrice = Number(totalPrice) || (numPricePerPerson * numPersons);

    const bookingData = {
      destinationId,
      destinationName,
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      persons: numPersons,
      pricePerPerson: numPricePerPerson,
      totalPrice: numTotalPrice,
      travelDate: travelDate || null,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await collection.insertOne(bookingData);
    res.status(201).json({ success: true, message: 'Booking submitted successfully!', id: result.insertedId, booking: { ...bookingData, _id: result.insertedId } });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit booking' });
  }
});

app.post('/booking/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('bookings');
    let query = null;
    let booking = null;

    if (ObjectId.isValid(id)) {
      try {
        query = { _id: new ObjectId(id) };
        booking = await collection.findOne(query);
      } catch (e) {
        // invalid ObjectId
      }
    }
    if (!booking) {
      query = { _id: id };
      booking = await collection.findOne(query);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update status to confirmed
    await collection.updateOne(query, { $set: { status: 'confirmed', confirmedAt: new Date() } });

    // Send Notification Email to User using nodemailer
    try {
      // Create test transporter or json transport
      let transporter = nodemailer.createTransport({
        jsonTransport: true
      });

      const mailOptions = {
        from: '"TravelKro Admin" <no-reply@travelkro.com>',
        to: booking.userEmail,
        subject: `Booking Confirmed: ${booking.destinationName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">🎉 Your Booking is Confirmed!</h2>
            <p>Dear <strong>${booking.userName}</strong>,</p>
            <p>Great news! Your travel reservation for <strong>${booking.destinationName}</strong> has been officially confirmed by our admin team.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Destination:</strong> ${booking.destinationName}</p>
              <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${booking.travelDate || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Travelers:</strong> ${booking.persons} person(s)</p>
              <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${(booking.totalPrice || 0).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Confirmed</span></p>
            </div>
            <p>Thank you for choosing TravelKro! We wish you a safe and memorable journey.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">TravelKro Inc. • Discover breathtaking destinations worldwide.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL NOTIFICATION SENT] To: ${booking.userEmail} | Subject: ${mailOptions.subject}`);
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
    }

    res.json({
      success: true,
      message: `Booking for ${booking.destinationName} confirmed! Notification email sent to ${booking.userEmail}.`
    });
  } catch (err) {
    console.error('Confirm booking error:', err);
    res.status(500).json({ success: false, message: 'Server error while confirming booking.' });
  }
});

app.get('/bookings', async (req, res) => {
  try {
    const collection = db.collection('bookings');
    const bookings = await collection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// User My-Bookings API (supports JWT cookie and email query param fallback)
app.get('/my-bookings', async (req, res) => {
  try {
    let userEmail = null;
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userEmail = decoded.email;
      } catch (e) {}
    }

    if (!userEmail && req.query.email) {
      userEmail = String(req.query.email).trim().toLowerCase();
    }

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Authentication required to view your bookings' });
    }

    const collection = db.collection('bookings');
    const bookings = await collection
      .find({ userEmail: userEmail.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Fetch user bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user bookings' });
  }
});

// Cancel Booking API (User or Admin)
app.patch(['/booking/cancel/:id', '/booking/:id/cancel'], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const collection = db.collection('bookings');

    let query = null;
    let booking = null;

    if (ObjectId.isValid(id)) {
      try {
        query = { _id: new ObjectId(id) };
        booking = await collection.findOne(query);
      } catch (e) {}
    }
    if (!booking) {
      query = { _id: id };
      booking = await collection.findOne(query);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    await collection.updateOne(query, {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Customer requested cancellation'
      }
    });

    res.json({
      success: true,
      message: `Reservation for ${booking.destinationName} has been cancelled successfully.`
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const collection = db.collection('users');
    const existingUser = await collection.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password with salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || 'user';

    const newUser = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newUser);

    // Create JWT Token
    const token = jwt.sign(
      { id: result.insertedId, name: cleanName, email: cleanEmail, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: result.insertedId, name: cleanName, email: cleanEmail, role: userRole }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const collection = db.collection('users');
    const user = await collection.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userRole = user.role || 'user';

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Sign in successful',
      user: { id: user._id, name: user.name, email: user.email, role: userRole }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ success: false, message: 'Server error during signin' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// Reviews & Testimonials API (Stored in 'reviews' schema collection)
app.get(['/reviews', '/testimonials'], async (req, res) => {
  try {
    const collection = db.collection('reviews');
    const reviews = await collection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, reviews, testimonials: reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

app.post(['/reviews', '/review', '/testimonial'], async (req, res) => {
  try {
    const collection = db.collection('reviews');
    const { name, role, destination, comment, rating, avatar, storyImage } = req.body;

    if (!name || !destination || !comment) {
      return res.status(400).json({ success: false, message: 'Name, destination, and comment are required.' });
    }

    const newReview = {
      name,
      role: role || 'Traveler',
      destination,
      comment,
      rating: Number(rating) || 5,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      storyImage: storyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date()
    };

    const result = await collection.insertOne(newReview);
    const createdItem = { ...newReview, _id: result.insertedId };
    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      review: createdItem,
      testimonial: createdItem
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

app.listen(port, () => {
  console.log(`TravelKro server listening on port ${port}`);
});
