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


// // Get all replies for a specific post
// router.get('/posts/:id/replies', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const post = await prisma.post.findUnique({
//             where: { id: parseInt(id) }
//         });

//         if (!post) {
//             return res.status(404).json({ message: 'Post tidak ditemukan' });
//         }

//         const replies = await prisma.reply.findMany({
//             where: { postId: parseInt(id) },
//             include: {
//                 author: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true
//                     }
//                 }
//             },
//             orderBy: {
//                 createdAt: 'asc'
//             }
//         });

//         res.json(replies);
//     } catch (error) {
//         console.error('Error fetching replies:', error);
//         res.status(500).json({ message: 'Gagal mengambil replies' });
//     }
// });

// // Create new reply for a specific post
// router.post('/posts/:id/replies', async (req, res) => {
//     const { id } = req.params;
//     const { content, authorId } = req.body;

//     if (!content || !authorId) {
//         return res.status(400).json({ message: 'Content dan authorId wajib diisi' });
//     }

//     try {
//         // Check if post exists
//         const post = await prisma.post.findUnique({
//             where: { id: parseInt(id) }
//         });

//         if (!post) {
//             return res.status(404).json({ message: 'Post tidak ditemukan' });
//         }

//         // Check if user exists
//         const user = await prisma.user.findUnique({
//             where: { id: parseInt(authorId) }
//         });

//         if (!user) {
//             return res.status(404).json({ message: 'User tidak ditemukan' });
//         }

//         const newReply = await prisma.reply.create({
//             data: {
//                 content,
//                 authorId: parseInt(authorId),
//                 postId: parseInt(id)
//             },
//             include: {
//                 author: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true
//                     }
//                 }
//             }
//         });

//         res.status(201).json(newReply);
//     } catch (error) {
//         console.error('Error creating reply:', error);
//         res.status(500).json({ message: 'Gagal membuat reply' });
//     }
// });

// // Update reply (optional - if you want to allow editing replies)
// router.put('/posts/:postId/replies/:replyId', async (req, res) => {
//     const { postId, replyId } = req.params;
//     const { content, authorId } = req.body;

//     try {
//         const existingReply = await prisma.reply.findUnique({
//             where: { id: parseInt(replyId) }
//         });

//         if (!existingReply) {
//             return res.status(404).json({ message: 'Reply tidak ditemukan' });
//         }

//         if (existingReply.authorId !== parseInt(authorId)) {
//             return res.status(403).json({ message: 'Tidak diizinkan mengedit reply orang lain' });
//         }

//         if (existingReply.postId !== parseInt(postId)) {
//             return res.status(400).json({ message: 'Reply tidak sesuai dengan post' });
//         }

//         const updatedReply = await prisma.reply.update({
//             where: { id: parseInt(replyId) },
//             data: {
//                 content: content || existingReply.content
//             },
//             include: {
//                 author: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true
//                     }
//                 }
//             }
//         });

//         res.json(updatedReply);
//     } catch (error) {
//         console.error('Error updating reply:', error);
//         res.status(500).json({ message: 'Gagal mengupdate reply' });
//     }
// });

// // Delete reply (optional - if you want to allow deleting replies)
// router.delete('/posts/:postId/replies/:replyId', async (req, res) => {
//     const { postId, replyId } = req.params;
//     const { authorId } = req.body;

//     try {
//         const existingReply = await prisma.reply.findUnique({
//             where: { id: parseInt(replyId) }
//         });

//         if (!existingReply) {
//             return res.status(404).json({ message: 'Reply tidak ditemukan' });
//         }

//         if (existingReply.authorId !== parseInt(authorId)) {
//             return res.status(403).json({ message: 'Tidak diizinkan menghapus reply orang lain' });
//         }

//         if (existingReply.postId !== parseInt(postId)) {
//             return res.status(400).json({ message: 'Reply tidak sesuai dengan post' });
//         }

//         await prisma.reply.delete({
//             where: { id: parseInt(replyId) }
//         });

//         res.json({ message: 'Reply berhasil dihapus' });
//     } catch (error) {
//         console.error('Error deleting reply:', error);
//         res.status(500).json({ message: 'Gagal menghapus reply' });
//     }
// });

export default router;