/*
# Title: Web Programming Group Assignment E-Commerse Website
#Authors: Bryan Jones (1907425), Sewayne Pearson (1406678), Roberto Forbes (1900631), Roydel Pottinger (2004406)

# Tested on: Chrome for Windows, Mozilla Firefox for Linux, Github Pages
#
#Description: Group Assignment E-Commerse Website containing HTML, CSS and Javascript code along with relevant Website Assets
#
#Note:
 * this script handles user registration, login, logout, and cart management using localstorage.
 * it includes functions to initialize data, manage user sessions, and handle cart operations.
 * this script is designed to mimic a web application where user data and cart information
 * are stored in the browser's localstorage.
 * it provides a simple way to manage user accounts and shopping carts without a backend server.
 * the script includes functions to generate unique trns, manage user data, and handle invoices.
 * it also includes error handling for parsing json data and ensures that cart operations
 * are performed safely, even if the data is not in the expected format.
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
  // check if trn and password match a user
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
      email: `guest_${currentUser.trn}@xyzrepairs.com`,
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
  const hasNull = users.some(user => user === null);
  // load default users if none exist or data is broken for testing
  if (users.length === 0 || hasNull) {
    const hardcodedUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        dob: '1990-01-01T00:00:00.000Z',
        gender: 'Other',
        phone: '000-000-0000',
        email: 'admin@xyzrepairs.com',
        trn: '000-000-001',
        password: 'admin1234',
        registrationDate: new Date('2025-01-01').toISOString(),
        cart: [],
        invoices: [
          {
            invoiceNumber: 1,
            trn: '000-000-001',
            date: new Date('2025-02-01').toISOString(),
            shippingName: 'Admin User',
            shippingAddress: '123 Admin St, Kingston',
            username: 'Admin User',
            items: [{ id: 1, name: 'Laptop Screen', price: 100, quantity: 1 }],
            subtotal: '100.00',
            discount: '10.00',
            tax: '15.00',
            total: '105.00'
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
        cart: [],
        invoices: [
          {
            invoiceNumber: 2,
            trn: '123-456-789',
            date: new Date('2025-02-15').toISOString(),
            shippingName: 'John Doe',
            shippingAddress: '456 Main St, Kingston',
            username: 'John Doe',
            items: [{ id: 2, name: 'Phone Battery', price: 50, quantity: 2 }],
            subtotal: '100.00',
            discount: '10.00',
            tax: '15.00',
            total: '105.00'
          }
        ],
        isAdmin: false
      }
    ];
    saveUsers(hardcodedUsers);
    return true;
  }
  return false;
}