require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const PlacementOffer = require('./models/PlacementOffer');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      PlacementOffer.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Collections cleared. Seeding accounts...');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await User.create({
      email: 'admin@cdu.edu',
      password: adminPassword,
      role: 'ADMIN',
    });

    // 2. Create Recruiters
    const recruiterPassword = await bcrypt.hash('Recruiter@123', 10);
    const googleRecruiter = await User.create({
      email: 'recruiter@google.com',
      password: recruiterPassword,
      role: 'RECRUITER',
    });

    const msftRecruiter = await User.create({
      email: 'recruiter@microsoft.com',
      password: recruiterPassword,
      role: 'RECRUITER',
    });

    // 3. Create Companies
    const googleCompany = await Company.create({
      name: 'Google India',
      description: 'Building world-class cloud, AI, and consumer technology for billions of users.',
      website: 'https://careers.google.com',
      industry: 'Internet & Cloud Services',
      location: 'Hyderabad, Telangana',
      recruiterId: googleRecruiter._id,
      status: 'APPROVED',
    });

    const msftCompany = await Company.create({
      name: 'Microsoft IDC',
      description: 'Empowering every person and organization on the planet to achieve more.',
      website: 'https://careers.microsoft.com',
      industry: 'Enterprise Software & Cloud',
      location: 'Hyderabad, Telangana',
      recruiterId: msftRecruiter._id,
      status: 'APPROVED',
    });

    // 4. Create Jobs
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 30);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 20);

    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 15);

    const job1 = await Job.create({
      companyId: googleCompany._id,
      recruiterId: googleRecruiter._id,
      title: 'Associate Software Engineer (Campus 2026)',
      description: 'Design and develop high-scale web platforms, distributed databases, and core infrastructure services. Experience in React, Node.js or Python is preferred.',
      roleType: 'FULL_TIME',
      location: 'Hyderabad / Bangalore',
      salaryOrStipend: '₹18,50,000 - ₹22,00,000 PA',
      minCgpa: 7.5,
      maxBacklogs: 0,
      eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      skillsRequired: ['Data Structures', 'React', 'Node.js', 'System Design'],
      deadline: futureDate1,
      status: 'APPROVED',
    });

    const job2 = await Job.create({
      companyId: msftCompany._id,
      recruiterId: msftRecruiter._id,
      title: 'Cloud Solutions Engineering Intern',
      description: 'Work with the Azure Engineering core team building containerized microservices and Kubernetes orchestration. 6-month pre-placement internship opportunity.',
      roleType: 'INTERNSHIP',
      location: 'Hyderabad',
      salaryOrStipend: '₹50,000 / month',
      minCgpa: 7.0,
      maxBacklogs: 1,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      skillsRequired: ['Azure', 'Python', 'Docker', 'Linux'],
      deadline: futureDate2,
      status: 'APPROVED',
    });

    const job3 = await Job.create({
      companyId: googleCompany._id,
      recruiterId: googleRecruiter._id,
      title: 'Data Analyst & Insights Associate',
      description: 'Leverage SQL and business intelligence dashboards to surface analytics for Google Cloud customer operations.',
      roleType: 'FULL_TIME',
      location: 'Bangalore',
      salaryOrStipend: '₹12,00,000 PA',
      minCgpa: 6.5,
      maxBacklogs: 1,
      eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical'],
      skillsRequired: ['SQL', 'Python', 'Tableau', 'Statistics'],
      deadline: futureDate3,
      status: 'APPROVED',
    });

    // 5. Create Students
    const studentPassword = await bcrypt.hash('Student@123', 10);

    const studentUser1 = await User.create({
      email: 'student@cdu.edu',
      password: studentPassword,
      role: 'STUDENT',
    });

    const studentProfile1 = await StudentProfile.create({
      userId: studentUser1._id,
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      rollNumber: '22CDUCS014',
      department: 'Computer Science',
      program: 'B.Tech',
      graduationYear: 2026,
      cgpa: 8.6,
      backlogCount: 0,
      skills: ['React', 'Node.js', 'MongoDB', 'Python', 'Docker'],
      resumeUrl: 'https://drive.google.com/file/d/sample-rahul-resume/view',
      githubUrl: 'https://github.com/rahul-sharma-dev',
      linkedinUrl: 'https://linkedin.com/in/rahulsharma',
      isPlaced: false,
    });

    const studentUser2 = await User.create({
      email: 'student2@cdu.edu',
      password: studentPassword,
      role: 'STUDENT',
    });

    const studentProfile2 = await StudentProfile.create({
      userId: studentUser2._id,
      fullName: 'Ananya Patel',
      phone: '+91 98123 45678',
      rollNumber: '22CDUEC042',
      department: 'Electronics & Comm',
      program: 'B.Tech',
      graduationYear: 2026,
      cgpa: 6.9,
      backlogCount: 1,
      skills: ['Python', 'SQL', 'Embedded Systems', 'IoT'],
      resumeUrl: 'https://drive.google.com/file/d/sample-ananya-resume/view',
      isPlaced: false,
    });

    // 6. Create Initial Applications
    // Rahul applies to Google Job (Interview Scheduled)
    const app1 = await Application.create({
      studentId: studentProfile1._id,
      jobId: job1._id,
      status: 'INTERVIEW_SCHEDULED',
      resumeUrl: studentProfile1.resumeUrl,
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Schedule interview for Rahul
    const interviewDate = new Date();
    interviewDate.setDate(interviewDate.getDate() + 2);
    interviewDate.setHours(11, 0, 0);

    await Interview.create({
      applicationId: app1._id,
      studentId: studentProfile1._id,
      jobId: job1._id,
      companyId: googleCompany._id,
      roundName: 'Technical Architecture & Coding Round',
      scheduledAt: interviewDate,
      mode: 'ONLINE',
      meetingLinkOrVenue: 'https://meet.google.com/abc-cdut-xyz',
      instructions: 'Please be in a quiet room with a stable internet connection. Prepare to solve 2 live coding questions.',
      status: 'SCHEDULED',
    });

    // Rahul applies to Microsoft (Offered!)
    const app2 = await Application.create({
      studentId: studentProfile1._id,
      jobId: job2._id,
      status: 'OFFERED',
      resumeUrl: studentProfile1.resumeUrl,
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    const joiningDate = new Date();
    joiningDate.setMonth(joiningDate.getMonth() + 2);

    await PlacementOffer.create({
      applicationId: app2._id,
      studentId: studentProfile1._id,
      jobId: job2._id,
      companyId: msftCompany._id,
      designation: 'Cloud Solutions Engineering Intern',
      ctc: '₹50,000 / month (Stipend) + Full-time PPO',
      joiningDate,
      offerLetterUrl: 'https://drive.google.com/file/d/sample-msft-offer/view',
      status: 'OFFERED',
    });

    // 7. Create Notifications
    await Notification.create([
      {
        userId: studentUser1._id,
        title: 'New Offer Letter Available! 🌟',
        message: 'Microsoft IDC has extended an offer for Cloud Solutions Engineering Intern. Review and respond in your offers tab.',
        type: 'OFFER',
        link: '/student/dashboard',
        isRead: false,
      },
      {
        userId: studentUser1._id,
        title: 'Technical Round Scheduled! 📅',
        message: `Google India scheduled your Technical Architecture Round for ${interviewDate.toLocaleDateString()} at 11:00 AM.`,
        type: 'INTERVIEW',
        link: '/student/dashboard',
        isRead: false,
      },
      {
        userId: studentUser2._id,
        title: 'Welcome to CampusConnect 🚀',
        message: 'Your student profile is active. Check out live openings matching your branch and eligibility!',
        type: 'SYSTEM',
        link: '/student/dashboard',
        isRead: false,
      },
    ]);

    console.log('Seeding completed successfully!');
    console.log('=============================================');
    console.log('DEMO ACCOUNTS:');
    console.log('Student 1:   student@cdu.edu   / Student@123 (CSE, CGPA 8.6)');
    console.log('Student 2:   student2@cdu.edu  / Student@123 (ECE, CGPA 6.9)');
    console.log('Recruiter 1: recruiter@google.com / Recruiter@123 (Google India)');
    console.log('Recruiter 2: recruiter@microsoft.com / Recruiter@123 (Microsoft IDC)');
    console.log('Admin:       admin@cdu.edu     / Admin@123 (Placement Cell)');
    console.log('=============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
