const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- HELPER FUNCTION: Membuat dan Mengirim JWT ---
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Ubah dokumen Mongoose menjadi objek JS biasa untuk menghapus properti secara bersih
    const userObject = user.toObject({ useProjection: true });
    // Hapus password dari objek yang akan dikirim ke client (walaupun sudah select: false, ini adalah pengaman tambahan)
    delete userObject.password; 

    // Kirim respons sukses dengan token dan data pengguna
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userObject,
        },
    });
};

// --- 1. REGISTRASI PENGGUNA BARU ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Cek duplikasi email sebelum membuat
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' 
            });
        }
        
        // 2. Buat pengguna baru. Password akan otomatis di-hash oleh middleware Mongoose (pre('save'))
        const newUser = await User.create({
            name,
            email,
            password,
        });

        // 3. Buat dan kirim JWT
        createSendToken(newUser, 201, res);

    } catch (error) {
        // Tangani error validasi Mongoose (misal: password terlalu pendek)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'fail', message: messages.join('. ') });
        }
        
        console.error('Registration Error:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat registrasi.' });
    }
};

// --- 2. LOGIN PENGGUNA ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cek apakah input lengkap
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Harap masukkan email dan password' 
            });
        }

        // 2. Cari pengguna di database dan secara eksplisit minta password (+password)
        const user = await User.findOne({ email }).select('+password');

        // 3. Cek apakah pengguna ada DAN passwordnya cocok (menggunakan metode kustom comparePassword)
        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ 
                status: 'fail', 
                message: 'Email atau password salah' 
            });
        }

        // 4. Jika verifikasi berhasil, buat dan kirim JWT
        createSendToken(user, 200, res);

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server saat login.' });
    }
};
