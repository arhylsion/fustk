const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        trim: true,
        maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter'],
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Format email tidak valid'],
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        minlength: [8, 'Password minimal 8 karakter'],
        select: false, // Penting: tidak mengirim password secara default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Metode Instance: Membandingkan password
// Dipindahkan ke sini (sebelum pre-save hook) untuk memastikan Mongoose mengikat metode dengan benar
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // Bandingkan password yang dikirim pengguna dengan hash yang tersimpan (this.password)
    return await bcrypt.compare(candidatePassword, this.password);
};


// Middleware Mongoose: Hash password sebelum disimpan
UserSchema.pre('save', async function (next) {
    // Hanya jalankan fungsi ini jika password benar-benar dimodifikasi
    if (!this.isModified('password')) return next();

    // Hash password dengan cost factor 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});


module.exports = mongoose.model('User', UserSchema);
