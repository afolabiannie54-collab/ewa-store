import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await connectDB()

        const user = await User.findOne({ email: credentials.email.toLowerCase() })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        if (!user.isEmailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isValidPassword) {
          throw new Error('Invalid email or password')
        }

        user.lastLoginAt = new Date()
        await user.save()

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectDB()

        let existingUser = await User.findOne({ email: user.email.toLowerCase() })

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email.toLowerCase(),
            googleId: account.providerAccountId,
            role: 'customer',
            isEmailVerified: true,
            lastLoginAt: new Date()
          })
        } else {
          existingUser.lastLoginAt = new Date()
          if (!existingUser.googleId) {
            existingUser.googleId = account.providerAccountId
          }
          await existingUser.save()
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      if (!token.role && token.email) {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }