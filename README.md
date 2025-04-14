# XYZ Repairs E-commerce Website

Welcome to the **XYZ Repairs** e-commerce website, built as a deliverable for the Web Programming Group Assignment. This project showcases a fully functional online store with user authentication, product catalog, shopping cart, checkout, and invoice generation powered by vanilla HTML, CSS, and JavaScript.

---

## 🌟 How to Run the Project

To explore the site, follow these steps:

1. **Clone or Download**: Grab the ZIP folder from our submission or clone the repo.
2. **Run via Web Server**: Due to the use of `fetch()` for loading product data (e.g., `products.json`), this project **must be served via a web server**. You can:
   - Use a local server like `Live Server` in VS Code.
   - Run `python -m http.server` in the project directory and access it at `http://localhost:8000`.
   - Deploy it to a hosting service (e.g., GitHub Pages doesn’t fully work due to `fetch()` restrictions).
3. **Start Here**: Open `index.html` in Chrome to land on the login page.

**Site URL**: [https://xhugh24.github.io/wp_assignment3/Codes/index.html](https://xhugh24.github.io/wp_assignment3/Codes/index.html)
---

## 🔑 Login Credentials

Test the site with these pre-registered accounts:

- **Admin Account**  
  - TRN: `000-000-001`  
  - Password: `admin1234`  
  - Redirects to: `dashboard.html` (Admin Dashboard)

- **Regular User**  
  - TRN: `123-456-789`  
  - Password: `Password123`  
  - Redirects to: `products.html` (Product Catalog)

---

## 👥 Group Members

The following members contributed to the development:

- **Bryan Jones (1907425)** 
- **Sewayne Pearson (1406678)**  
- **Roberto Forbes (1900631)**
- **Roydel Pottinger (2004406)**

---

## 🛠️ Frameworks & Tools Used

The folowing external resources were used:
- **Google Fonts**: Poppins
- **Boxicons**: Tiny, stylish icons (v2.1.4) for buttons and navigation.  
- **JavaScript Built in code**: localStorage, JSON handling, and dynamic page updates.  

No CSS OR JavaScript frameworks were used in the project.

---

## 📝 Project Notes

- Built for **Chrome** as per submission guidelines.
- Uses `localStorage` to store user data, carts, and invoices accross pages.
- Responsive design with CSS Grid and Flexbox.