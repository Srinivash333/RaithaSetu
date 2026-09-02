# Database Schema Documentation

## Mongoose Schemas & Indexing

### 1. User
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed bcrypt)
- `phone`: String
- `role`: Enum (`farmer`, `worker`, `store`, `trader`, `admin`)
- `location`: `{ type: "Point", coordinates: [lng, lat] }` (Index: `2dsphere`)

### 2. Job
- `farmerId`: ObjectId (Ref User)
- `title`: String
- `crop`: String
- `workType`: String
- `workersNeeded`: Number
- `location`: Point (2dsphere)
- `duration`: Enum (`Hourly`, `Daily`, `Weekly`, `Monthly`, `Seasonal`)
- `wage`: Number
- `status`: Enum (`open`, `applications_received`, `worker_selected`, `in_progress`, `completed`, `cancelled`)

### 3. Application
- `jobId`: ObjectId (Ref Job)
- `workerId`: ObjectId (Ref User)
- `farmerId`: ObjectId (Ref User)
- `status`: Enum (`applied`, `shortlisted`, `accepted`, `rejected`, `withdrawn`)
- Compound Index: `{ jobId: 1, workerId: 1 }` (Unique)

### 4. CropListing
- `farmerId`: ObjectId
- `cropName`: String
- `quantity`: Number
- `expectedPricePerUnit`: Number
- `location`: Point (2dsphere)

### 5. AgroProduct
- `storeId`: ObjectId
- `productName`: String
- `category`: Enum (`seeds`, `fertilizers`, `pesticides`, `tools`, `machinery`)
- `price`: Number
- `stockQuantity`: Number

### 6. Order
- `buyerId`: ObjectId
- `sellerId`: ObjectId
- `totalAmount`: Number
- `paymentMethod`: Enum (`upi`, `card`, `cod`)
- `paymentStatus`: Enum (`demo_paid`, `pending_cod`, `failed`)
- `orderStatus`: Enum (`pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`)
