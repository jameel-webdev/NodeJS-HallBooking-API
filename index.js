import express from "express";
const port = 5000;

//EXPRESS INITIATED
const app = express();

//MIDDLEWARE
app.use(express.json()); // HELPS SEND DATA
app.use(express.urlencoded({ extended: true })); //HELPS TO SEND FORM DATA

// Local variables to store data
const rooms = [];
const bookings = [];

// 1--Create Room with { no.of.seats, amenities, price}
app.post("/rooms", (request, response) => {
  try {
    const { numberOfSeats, amenities, pricePerHour } = request.body;
    //creating newRoom
    const newRoom = {
      id: rooms.length + 1,
      numberOfSeats,
      amenities,
      pricePerHour,
    };
    rooms.push(newRoom);
    response
      .status(200)
      .json({ room: newRoom })
      .send(`Room Created Succesfully`);
  } catch (error) {
    response.status(500).json({ error: `Error while creating room` });
  }
});

// 2--Booking a Room with {customerName, date, startTime, endTime, roomId}
app.post("/bookings", (request, response) => {
  try {
    const { customerName, date, startTime, endTime, roomId } = request.body;
    //Booking a room
    // Check if the room is already booked for the same date and time
    const alreadyBooked = bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        booking.date === date &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime))
    );

    if (alreadyBooked) {
      return response
        .status(400)
        .json({ error: "Room is already booked for the same date and time." });
    }

    const booking = {
      id: bookings.length + 1,
      customerName,
      date,
      startTime,
      endTime,
      roomId,
    };
    bookings.push(booking);
    response.status(200).json({ Booked: booking }).send(`Booking Succesfully`);
  } catch (error) {
    response.status(400).json({ error: `Error while booking` });
  }
});

// 3--List all rooms with booked data with {roomName, bookedStatus, customerName, date, startTime,endTime}
app.get("/rooms/booked", (request, response) => {
  try {
    const result = rooms.map((room) => {
      //   console.log(rooms, bookings);
      const booking = bookings.find((b) => b.roomId === room.id);
      return {
        roomName: `Star ${room.id}`,
        bookedStatus: booking ? "Booked" : "Available",
        customerName: booking ? booking.customerName : null,
        date: booking ? booking.date : null,
        startTime: booking ? booking.startTime : null,
        endTime: booking ? booking.endTime : null,
      };
    });
    response.status(200).json({ Bookedroom: result });
  } catch (error) {
    response.status(500).json({ error: `Error fetching bookings data` });
  }
});

// 4--List all customers with booked data with {roomName, customerName, date, startTime,endTime}
app.get("/list_customers_bookings", (request, response) => {
  try {
    const { roomName, date, startTime, endTime } = request.query;

    // Filter bookings based on parameters
    const filteredBookings = bookings.filter((booking) => {
      return (
        (!roomName || booking.roomName === roomName) &&
        (!date || booking.date === date) &&
        (!startTime || booking.startTime === startTime) &&
        (!endTime || booking.endTime === endTime)
      );
    });

    // Extract unique customer names from filtered bookings
    const uniqueCustomerNames = [
      ...new Set(filteredBookings.map((booking) => booking.customerName)),
    ];

    // Create a list of customers with their booked data
    const customersWithBookings = uniqueCustomerNames.map((customerName) => {
      const customerBookings = filteredBookings.filter(
        (booking) => booking.customerName === customerName
      );
      return { customerName, bookings: customerBookings };
    });

    response.json({ customersWithBookings });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 5--List how many times a customer has booked the room with {customerName,roomName,date,startTime,endTime,bookingId,bookingDate,bookingStatus}
app.get("/customers/booking-count", (request, response) => {
  const { customerName } = request.query;
  const customerBookings = bookings.filter(
    (b) => b.customerName === customerName
  );
  response.json(customerBookings);
});

//SERVER LISTENING IN PORT
app.get("/", (request, response) => {
  response.json({ message: `Welcome to Hall Booking Server` });
});
app.listen(port, (request, response) => {
  console.log(`Server running in port ${port}`);
});
