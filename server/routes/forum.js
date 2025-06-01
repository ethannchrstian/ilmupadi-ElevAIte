import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Gagal mengambil data posts' });
    }
});

// Create new post
router.post('/posts', async (req, res) => {
    const { title, content, authorId } = req.body;

    if (!title || !content || !authorId) {
        return res.status(400).json({ message: 'Title, content, dan authorId wajib diisi' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(authorId) }
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: parseInt(authorId)
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Gagal membuat post baru' });
    }
});

// Get single post by ID
router.get('/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post tidak ditemukan' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Gagal mengambil data post' });
    }
});

// Update post
router.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, authorId } = req.body;

    try {
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return res.status(404).json({ message: 'Post tidak ditemukan' });
        }

        if (existingPost.authorId !== parseInt(authorId)) {
            return res.status(403).json({ message: 'Tidak diizinkan mengedit post orang lain' });
        }

        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: {
                title: title || existingPost.title,
                content: content || existingPost.content
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Gagal mengupdate post' });
    }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { authorId } = req.body;

    try {
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return res.status(404).json({ message: 'Post tidak ditemukan' });
        }

        if (existingPost.authorId !== parseInt(authorId)) {
            return res.status(403).json({ message: 'Tidak diizinkan menghapus post orang lain' });
        }

        await prisma.post.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Post berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Gagal menghapus post' });
    }
});

export default router;