# **devBlog Backend**

Welcome to the repository for the backend of devBlog, the practice project for building a RESTful API blog.
For the frontend part of devBlog app, you can follow this link to access it [**devBlog frontend repo**](https://github.com/SaidAoussar/devBlog-frontend).

### **Built With**

- **[NestJs](https://nestjs.com/)** - Node.js framework for building server-side applications.
- **[Prisma](https://www.prisma.io/)** - Next-generation Node.js and TypeScript ORM.
- **[PostgreSQL](https://www.postgresql.org/)** - Open Source Relational Database.

### **Getting Started**

These instructions will get you a copy of the project up and running on your local machine for development.

### **Prerequisites**

Before you begin, make sure you have installed the following software on your machine:

- **[Node.js](https://nodejs.org/en/download/)**
- **[PostgreSQL](https://www.postgresql.org/)**

### **Installation**

1. Clone the repository to your local machine using the following command:

```bash
git clone https://github.com/SaidAoussar/devBlog-backend.git
```

2. Navigate to the project directory:

```
cd devBlog-backend
```

3. Install the required dependencies using the following command:

```
npm install
```

4. Create a **`.env`** file in the root of the project and fill in the following information:

```

DATABASE_URL="postgresql://username:password@localhost:5432/nestblog-db?schema=public"

#mail config
MAIL_USER="email use to send reset password (forgot password)"
MAIL_PASS="password access this email"

#JWT
JWT_SECRET= "your secret key"

FRONTEND_URL = "the url use to redirected user when click reset password in email"
```

5. Start the server using the following command:

```
npm run start:dev
```

6. The backend should now be up and running at **`http://localhost:3000`**.
7. The REST API Documentation Swagger UI running at **`http://localhost:3000/api`**.

### **API Endpoints**

The following is a list of the available API endpoints:

Posts :

- **`GET /posts`** : retrieves a list of all posts.
- **`POST /posts`** : creates a new post
- **`GET /posts/user/:userId`** : retrieves a list of all posts, create by specific user.
- **`GET /posts/:id`** : retrieves a specific post by its ID
- **`DELETE /posts/:id`** : deletes a specific post by its ID
- **`GET /posts/slug/:slug`** : retrieves a specific post by its SLUG
- **`PATCH /posts/:slug`** : updates a specific post by its SLUG
- **`GET /posts/nbr-posts-user/:userId`** : retrieves the total number of posts created by a specific user.
- **`GET /posts/nbr-posts-tag/:tagId`** : Retrieves the number of posts associated with a specific tag.

Users :

- **`GET /users`** : retrieves a list of all users.
- **`GET /users/:id`** : retrieves a specific user by its ID.
- **`PATCH /users/:id`**: updates a specific user by its ID.
- **`GET /users/user/:username`** : retrieves a specific user by its USERNAME.
- **`PATCH /users/update-password`** : updates the password for a specified user ( use their unique user ID extracted from their authentication token).
- **`PATCH /users/update-mode`** : updates the mode (LIGHT/DARK) for a specified user ( use their unique user ID extracted from their authentication token).

Auth:

- **`POST /auth/login`** : login an existing user.
- **`POST /auth/register`** : register a new user.
- **`GET /auth/activate_account/:token`** : active account of user ( user receive email from that email can active their account ).
- **`GET /auth/forgot-password/:email`** : sends password reset instructions to the registered email of a user.
- **`Patch /auth/reset-password`** : resets password for a specific user.

Tags:

- **`POST /tags`** : create a new tags.
- **`GET /tags`** : retrieves a list of all tags.
- **`GET /tags/:id`** : retrieves a specific tag by its ID.
- **`PATCH /tags/:id`** : updates a specific tag by its ID.
- **`DELETE /tags/:id`** : delete a specific tag by its ID.

Comments:

- **`POST /comments`** : create a new comments.
- **`GET /comments/:postId`** : retrieves a list of all comments associated with a specific post.
- **`GET /comments/nbrCommentsOfUser/:userId`** : retrieves the total number of comments created by a specific user.
- **`PATCH /comments/:id`** : updates a specific comment by its ID.
- **`DELETE /comments/:id`** : delete a specific comment by its ID.

Post-reactions:

- **`POST /post-reactions`** : adds a user's like to a post.
- **`GET /post-reactions/check`** : check if the authenticated user has Liked a specific post.
- **`GET /post-reactions/:postId`** : retrieves the total number of likes for spicific post.

Saves:

- **`POST /saves`** : add a post to the saved list of the authenticated user.
- **`GET /saves`** : retrieves a list of all saved posts by the authenticated user (you can filter list by tag).
- **`GET /saves/find-all-tags`** : retrieves all tags associated with specific saved list of the authenticated user.
- **`GET /saves/check`** : check if the authenticated user has bookmarked a specific post.
- **`GET /saves/:postId`** : retrieves the total count of saves for a specific post.
- **`POST /saves/:id`** : delete a specific saves by its ID.
