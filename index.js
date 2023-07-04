const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
/*

Postman documentation url - https://documenter.getpostman.com/view/27867831/2s93zE1ysM

*/
//creating variables for storing data
let rooms = [{
    roomId:"R1",
    seatsAvailable:"4",
    amenities:"tv,ac,heater",
    pricePerhr:"100"
}];
let bookings = [{
    customer: "Selva",
    bookingDate: "20230612",
    startTime: "12:00pm",
    endTime: "11:59am",
    bookingID: "B1",
    roomId: "R1",
    status: "booked",
    booked_On: "3/7/2023"
}
];
let customers = [
    { name: 'Selva',
     bookings: [ 
        {
            customer: 'Selva',
            bookingDate: '20230612',
            startTime: '12:00pm',
            endTime: '11:59am',
            bookingID: 'B1',
            roomId: 'R1',
            status: 'booked',
            booked_On: '3/7/2023'
          }
      ] }
];



// view all Rooms and its details
app.get('/rooms/all', (req, res)=> {
    res.status(200).json({RoomsList : rooms});
    console.log(rooms)
  })

//API endpoint for creating room
app.post('/rooms/create',(req,res) => {
    const room = req.body;
    const idExists = rooms.find((el)=> el.roomId === room.roomId)
    if(idExists !== undefined){
        return res.status(400).json({message:"room already exists."});
    }
    else{
    rooms.push(room);
    res.status(201).json({message:"room created"});
}
   

    
});
// api endpoint for booking room
app.post("/booking/create/:id", (req,res)=>{
    try{
      const {id} = req.params;
      let bookRoom = req.body; 
      let date = new Date();
      let dateFormat = date.toLocaleDateString();
      let idExists = rooms.find((el)=> el.roomId === id)
      if(idExists === undefined){
          return res.status(400).json({message:"room does not exist.", RoomsList:rooms});
  
      }
//verifying the booked date      
      let matchID = bookings.filter((b)=> b.roomId===id) 
      if(matchID.length > 0){
          let dateCheck = matchID.filter((m)=>{ return m.bookingDate === bookRoom.bookingDate});
          if(dateCheck.length===0){
              let newID = "B"+(bookings.length + 1);
              let newbooking = {...bookRoom, bookingID: newID, roomId:id, status:"booked", booked_On: dateFormat}
              bookings.push(newbooking);
              return res.status(201).json({message:"hall booked", Bookings:bookings, added:newbooking});
          }
          else{
              return res.status(400).json({message:"hall already booked for this date, choose another hall", Bookings:bookings});
          }
      }
      else{
              let newID = "B"+(bookings.length + 1);
              let newbooking = {...bookRoom, bookingID: newID, roomId:id, status:"booked",booked_On: dateFormat}
              bookings.push(newbooking);
              const customerdetails = customers.find(cust => 
                cust.name === newbooking.customer);
                if (customerdetails) {
                    customerdetails.bookings.push(newbooking);
                } else {
                    customers.push({ name:newbooking.customer,bookings:[newbooking]});
                }
              return res.status(201).json({message:"hall booked", Bookings:bookings, added:newbooking});
  
      }
    }
    catch(error){
        res.status(400).json({message:"error booking room", error: error, data:bookings});
    }
})

// api endpoint for viewing all the booked room
app.get('/viewbooking',(req,res) => {
    const bookedRooms = bookings.map(booking => {
        const {roomId ,Status,customer,bookingDate,startTime,endTime} = booking;
        return {roomId ,Status,customer,bookingDate,startTime,endTime} 
    });
    res.status(201).json(bookedRooms);
});

//api to list all the customers with booked data
app.get('/customers', (req, res) => {
    const customerBookings = customers.map(customer => {
      const { name, bookings } = customer;
      const customerDetails = bookings.map(booking => {
        const { roomId, bookingDate, startTime, endTime } = booking;
        return { name, roomId, bookingDate, startTime, endTime };
      });
     
      return customerDetails;
    })
   
    res.json(customerBookings);
  });

// api to list how many times the user booked the room
  app.get('/customer/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(cust => cust.name === name);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    const customerBookings = customer.bookings.map(booking => {
      const { customer,roomId, startTime, endTime, bookingID, status, bookingDate,booked_On } = booking;
      return { customer, roomId, startTime, endTime, bookingID, status, bookingDate,booked_On };
    });
    res.json(customerBookings);
  });


app.listen(4000, ()=> console.log("started server hallbooking"));
