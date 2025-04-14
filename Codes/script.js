/*
# Title: Web Programming Group Assignment E-Commerse Website
#Authors: Bryan Jones (1907425), Sewayne Pearson (1406678), Roberto Forbes (1900631), Roydel Pottinger (2004406)

# Tested on: Chrome for Windows, Mozilla Firefox for Linux, Github Pages
#
#Description: Group Assignment E-Commerse Website containing HTML, CSS and Javascript code along with relevant Website Assets
#
#Note:
 * this script centralizes (handles) user registration, login, logout, and cart management using localStorage.
 * it includes functions to initialize data, manage user sessions, and handle cart operations.
 * this script is designed to mimic a web application where user data and cart information
 * are stored in the browser's localstorage.
 * it provides a simple way to manage user accounts and shopping carts without a backend server.
 * the script includes functions to generate unique trns, manage user data, and handle invoices.
 * it also includes error handling for parsing json data and ensures that cart operations
 * are performed safely, even if the data is not in the expected format.
 * 
 * The functions defined in the script were refactored to improve readability and maintainability while using less lines of code.
 * 
 * The script also hardcodes some users and invoices for testing purposes.
 */

function getUsers() {
  // get users from local storage, default to empty array if none
  return JSON.parse(localStorage.getItem('RegistrationData') || '[]');
}

function saveUsers(users) {
  // save users to local storage
  localStorage.setItem('RegistrationData', JSON.stringify(users));
}

function getCurrentUser() {
  // get current user from local storage, default to empty object if none
  return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

function setCurrentUser(user) {
  // save current user to local storage
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  // remove current user from local storage
  localStorage.removeItem('currentUser');
}

function generateTRN() {
  // create a random 9-digit trn with dashes (e.g., 123-456-789)
  const part1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const part3 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${part1}-${part2}-${part3}`;
}

function generateInvoiceNumber() {
  // get next invoice number based on total invoices
  const allInvoices = getAllInvoices();
  return allInvoices.length + 1;
}

function findUserByTRN(trn) {
  // find user by trn, filter out null users first
  const users = getUsers().filter(user => user !== null);
  return users.find(user => user.trn === trn);
}

function loginUser(trn, password) {
  // check if trn and password match a user in localStorage
  const user = findUserByTRN(trn);
  if (user && user.password === password) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

function logoutUser() {
  // clear current user
  clearCurrentUser();
}

function getCart() {
  const currentUser = getCurrentUser();
  console.log('Current user:', currentUser);
  if (currentUser.trn) {
    const user = findUserByTRN(currentUser.trn);
    console.log('Found user for cart:', user);
    // return user's cart or empty array if invalid
    return Array.isArray(user?.cart) ? user.cart : [];
  }
  // handle guest cart, parse it or return empty array if error
  const guestCart = localStorage.getItem('guestCart');
  let cart;
  try {
    cart = guestCart ? JSON.parse(guestCart) : [];
  } catch (e) {
    console.error('Error parsing guestCart, resetting to empty array:', e);
    cart = [];
  }
  return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
  // ensure cart is an array before saving
  if (!Array.isArray(cart)) {
    console.warn('Cart is not an array, resetting to empty array:', cart);
    cart = [];
  }
  const currentUser = getCurrentUser();
  if (currentUser.trn) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.trn === currentUser.trn);
    if (userIndex !== -1) {
      users[userIndex].cart = cart;
      saveUsers(users);
      setCurrentUser(users[userIndex]);
    } else {
      console.warn('User not found in RegistrationData for cart save:', currentUser.trn);
    }
  } else {
    localStorage.setItem('guestCart', JSON.stringify(cart));
  }
  // trigger cart update event
  window.dispatchEvent(new Event('cartUpdated'));
}

function addToCart(product) {
  let cart = getCart();
  // check if item already in cart
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  saveCart(cart);
}

function updateCartQuantity(id, change) {
  let cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    // remove item if quantity is 0 or less
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
  }
}

function removeFromCart(id) {
  // remove item from cart by id
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
}

function clearCart() {
  // empty the cart
  saveCart([]);
}

function getAllInvoices() {
  // get all invoices from all users
  const users = getUsers().filter(user => user !== null);
  return users.flatMap(user => user.invoices || []);
}

function saveInvoice(invoice) {
  const currentUser = getCurrentUser();
  let users = getUsers();
  const userIndex = users.findIndex(u => u.trn === currentUser.trn);

  if (userIndex !== -1) {
    // add invoice to existing user
    users[userIndex].invoices = users[userIndex].invoices || [];
    users[userIndex].invoices.push(invoice);
    saveUsers(users);
    setCurrentUser(users[userIndex]);
  } else if (currentUser.trn) {
    // create new guest user with invoice if no existing user found
    const newUser = {
      firstName: 'Guest',
      lastName: 'User',
      dob: '1990-01-01T00:00:00.000Z',
      gender: 'Other',
      phone: '000-000-0000',
      email: `guest_${currentUser.trn}@xyzrepairs.com`, // unique email for guest
      trn: currentUser.trn,
      password: '',
      registrationDate: new Date().toISOString(),
      cart: [],
      invoices: [invoice],
      isAdmin: false
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
  }
}

function initializeGuestSession() {
  const currentUser = getCurrentUser();
  // start guest session if no trn
  if (!currentUser.trn) {
    const guestUser = { trn: generateTRN(), cart: [], invoices: [] };
    setCurrentUser(guestUser);
  }
}

function initializeData() {
  let users = getUsers();
  //the following are hardcoded users with their respective invoices and cart items 
  // these users are used to test the functionality of the website
  const hardcodedUsers = [
    {
      firstName: 'Admin',
      lastName: 'User',
      dob: '1990-01-01T00:00:00.000Z',
      gender: 'Other',
      phone: '1234567890',
      email: 'admin@xyzrepairs.com',
      trn: '000-000-001',
      password: 'admin1234',
      registrationDate: new Date('2025-01-01').toISOString(),
      cart: [
        {
          id: "1",
          name: "Laptop RAM",
          price: 50.00,
          image: "../Assets/laptop-ram.png",
          description: "High-speed DDR4 RAM for laptops",
          quantity: 1
        },
        {
          id: "4",
          name: "Laptop Charger",
          price: 15.00,
          image: "../Assets/laptop-charger.png",
          description: "Universal laptop power adapter",
          quantity: 2
        }
      ],
      invoices: [
        {
          invoiceNumber: 1,
          trn: '000-000-001',
          date: new Date('2025-02-01').toISOString(),
          shippingName: 'Admin User',
          shippingAddress: '123 Admin St, Kingston',
          username: 'Admin User',
          items: [
            {
              id: "10",
              name: "Laptop SSD",
              price: 70.00,
              quantity: 2
            }
          ],
          subtotal: '140.00',
          discount: '14.00',
          tax: '21.00',
          total: '147.00'
        }
      ],
      isAdmin: true
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1995-05-15T00:00:00.000Z',
      gender: 'Male',
      phone: '123-456-7890',
      email: 'john.doe@xyzrepairs.com',
      trn: '123-456-789',
      password: 'Password123',
      registrationDate: new Date('2025-01-02').toISOString(),
      cart: [
        {
          id: "9",
          name: "Smartphone Battery",
          price: 30.00,
          image: "../Assets/smartphone-battery.png",
          description: "High-capacity battery for smartphones",
          quantity: 1
        }
      ],
      invoices: [
        {
          invoiceNumber: 2,
          trn: '123-456-789',
          date: new Date('2025-02-15').toISOString(),
          shippingName: 'John Doe',
          shippingAddress: '456 Main St, Kingston',
          username: 'John Doe',
          items: [
            {
              id: "3",
              name: "Smartphone Screen",
              price: 100.00,
              quantity: 1
            },
            {
              id: "5",
              name: "Smartphone Case",
              price: 10.00,
              quantity: 2
            }
          ],
          subtotal: '120.00',
          discount: '12.00',
          tax: '18.00',
          total: '126.00'
        }
      ],
      isAdmin: false
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dob: '1988-03-22T00:00:00.000Z',
      gender: 'Female',
      phone: '876-555-1234',
      email: 'sarah.johnson@xyzrepairs.com',
      trn: '987-654-321',
      password: 'Password123',
      registrationDate: new Date('2025-01-03').toISOString(),
      cart: [
        {
          id: "11",
          name: "Smartphone Charger",
          price: 15.00,
          image: "../Assets/smartphone-charger.png",
          description: "Fast-charging USB-C charger for smartphones",
          quantity: 2
        },
        {
          id: "5",
          name: "Smartphone Case",
          price: 10.00,
          image: "../Assets/smartphone-case.png",
          description: "Durable protective case for smartphones",
          quantity: 1
        }
      ],
      invoices: [
        {
          invoiceNumber: 3,
          trn: '987-654-321',
          date: new Date('2025-03-01').toISOString(),
          shippingName: 'Sarah Johnson',
          shippingAddress: '789 Ocean Ave, Kingston',
          username: 'Sarah Johnson',
          items: [
            {
              id: "4",
              name: "Laptop Charger",
              price: 15.00,
              quantity: 3
            }
          ],
          subtotal: '45.00',
          discount: '4.50',
          tax: '6.75',
          total: '47.25'
        }
      ],
      isAdmin: false
    },
    {
      firstName: 'Michael',
      lastName: 'Brown',
      dob: '1975-11-10T00:00:00.000Z',
      gender: 'Male',
      phone: '876-444-5678',
      email: 'michael.brown@xyzrepairs.com',
      trn: '456-789-123',
      password: 'Password123',
      registrationDate: new Date('2025-01-04').toISOString(),
      cart: [
        {
          id: "2",
          name: "Laptop Keyboard",
          price: 20.00,
          image: "../Assets/laptop-keyboard.png",
          description: "Replacement keyboard for laptops",
          quantity: 1
        },
        {
          id: "12",
          name: "Laptop Fan",
          price: 35.00,
          image: "../Assets/laptop-fan.png",
          description: "Cooling fan for laptops",
          quantity: 1
        }
      ],
      invoices: [
        {
          invoiceNumber: 4,
          trn: '456-789-123',
          date: new Date('2025-03-10').toISOString(),
          shippingName: 'Michael Brown',
          shippingAddress: '321 Hill Rd, Kingston',
          username: 'Michael Brown',
          items: [
            {
              id: "6",
              name: "Laptop Battery",
              price: 60.00,
              quantity: 2
            }
          ],
          subtotal: '120.00',
          discount: '12.00',
          tax: '18.00',
          total: '126.00'
        }
      ],
      isAdmin: false
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      dob: '1992-07-30T00:00:00.000Z',
      gender: 'Female',
      phone: '876-333-9012',
      email: 'emily.davis@xyzrepairs.com',
      trn: '321-123-456',
      password: 'Password123',
      registrationDate: new Date('2025-01-05').toISOString(),
      cart: [
        {
          id: "7",
          name: "laptop Microphone",
          price: 25.00,
          image: "../Assets/laptop-microphone.png",
          description: "Built-in microphone for laptops",
          quantity: 1
        },
        {
          id: "8",
          name: "Laptop Touchpad",
          price: 12.00,
          image: "../Assets/laptop-touchpad.png",
          description: "Responsive touchpad for laptops",
          quantity: 2
        }
      ],
      invoices: [
        {
          invoiceNumber: 5,
          trn: '321-123-456',
          date: new Date('2025-03-20').toISOString(),
          shippingName: 'Emily Davis',
          shippingAddress: '654 Park Lane, Kingston',
          username: 'Emily Davis',
          items: [
            {
              id: "1",
              name: "Laptop RAM",
              price: 50.00,
              quantity: 1
            },
            {
              id: "11",
              name: "Smartphone Charger",
              price: 15.00,
              quantity: 2
            }
          ],
          subtotal: '80.00',
          discount: '8.00',
          tax: '12.00',
          total: '84.00'
        }
      ],
      isAdmin: false
    }
  ];

// always initialize storage with hardcoded users, but preserve existing users with different TRNs
// Keep users that do not have the same TRN as hardcoded users
let usersToKeep = [];
for (let user of users) {
    let hasMatchingTRN = false;
    for (let mockUser of hardcodedUsers) {
        if (user && mockUser.trn === user.trn) {
            hasMatchingTRN = true;
            break;
        }
    }
    if (!hasMatchingTRN && user) {
        usersToKeep.push(user);
    }
}

// combine the users we want to keep with hardcoded users
let allUsers = [];
for (let user of usersToKeep) {
    allUsers.push(user);
}
for (let mockUser of hardcodedUsers) {
    allUsers.push(mockUser);
}

// save the combined list of users to localStorage
saveUsers(allUsers);

return true;
}