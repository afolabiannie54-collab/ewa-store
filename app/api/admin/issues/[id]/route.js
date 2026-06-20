import connectDB from '@/lib/mongodb'
import OrderIssue from '@/models/OrderIssue'
import { sendOrderEmail } from '@/lib/email'
import { requireAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const issue = await OrderIssue.findById(id)
      .populate('orderId', 'orderNumber items')
      .populate('userId', 'name email')

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ issue }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Get issue error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await params
    const { status, adminNote } = await req.json()

    const issue = await OrderIssue.findById(id).populate('userId', 'name email')

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const validTransitions = {
      Pending: ['Approved', 'Rejected'],
      Approved: ['Resolved']
    }

    if (!validTransitions[issue.status]?.includes(status)) {
      return NextResponse.json({ error: `Cannot move from ${issue.status} to ${status}` }, { status: 400 })
    }

    issue.status = status
    if (adminNote) issue.adminNote = adminNote
    await issue.save()

    const emailContent = {
      Approved: {
        subject: 'Update on your reported issue',
        heading: 'Issue Approved',
        message: `Your reported issue has been approved. ${adminNote || 'Our team will be in touch shortly to resolve this.'}`
      },
      Rejected: {
        subject: 'Update on your reported issue',
        heading: 'Issue Reviewed',
        message: `We've reviewed your reported issue. ${adminNote || 'Unfortunately we were unable to approve this report.'}`
      },
      Resolved: {
        subject: 'Your issue has been resolved',
        heading: 'Issue Resolved',
        message: `Your reported issue has been marked as resolved. ${adminNote || 'Thank you for your patience.'}`
      }
    }

    const content = emailContent[status]
    if (content && issue.userId?.email) {
      await sendOrderEmail(issue.userId.email, content.subject, content.heading, content.message)
        .catch(err => console.error('Email send failed:', err))
    }

    return NextResponse.json({ issue }, { status: 200 })

  } catch (error) {
    if (error.message === 'Not authorized') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    console.error('Update issue error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}