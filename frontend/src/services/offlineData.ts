export const offlineHomeCourses = [
  {
    _id: 'offline-class-math-10',
    titleText: 'Mathematics Foundations',
    descriptionText: 'Core problem solving, algebra basics, and exam preparation for secondary students.',
    duration: '12 weeks',
    fee: 12000,
    instructorName: 'Nokta Academy Teacher',
    enrollmentStatus: 'open',
    imageUrl: '/images/stunet/b1.jpg',
    academicCategory: 'Class Program',
    schedule: 'Saturday to Wednesday'
  },
  {
    _id: 'offline-class-science-9',
    titleText: 'Science and Study Skills',
    descriptionText: 'Structured science lessons with practical revision habits and weekly progress checks.',
    duration: '10 weeks',
    fee: 10000,
    instructorName: 'Academic Department',
    enrollmentStatus: 'open',
    imageUrl: '/images/stunet/b3.jpg',
    academicCategory: 'Academic Support',
    schedule: 'Morning and afternoon groups'
  },
  {
    _id: 'offline-class-language',
    titleText: 'English, Dari, and Pashto Literacy',
    descriptionText: 'Reading, writing, grammar, and communication support for multilingual learners.',
    duration: '8 weeks',
    fee: 8000,
    instructorName: 'Language Faculty',
    enrollmentStatus: 'open',
    imageUrl: '/images/stunet/b4.jpg',
    academicCategory: 'Language Program',
    schedule: 'Flexible weekly sessions'
  }
];

export const offlineHomeAnnouncements = [
  {
    _id: 'offline-announcement-registration',
    title: 'Registration is open',
    description: 'Students can register for available academic classes when the local server is running.',
    publishDate: new Date().toISOString(),
    className: 'General Academic Class',
    subjectName: 'Core Subjects',
    teacherName: 'Nokta Academy Team'
  },
  {
    _id: 'offline-announcement-offline',
    title: 'Offline mode is available',
    description: 'Previously opened pages and cached records remain available when internet access is unavailable.',
    publishDate: new Date().toISOString()
  }
];

export const offlineRegistrationOptions = {
  classes: [
    {
      _id: 'offline-class-math-10',
      className: 'Mathematics Foundations',
      classCode: 'OFF-MATH-10',
      branchId: null,
      feeAmount: 12000
    },
    {
      _id: 'offline-class-science-9',
      className: 'Science and Study Skills',
      classCode: 'OFF-SCI-09',
      branchId: null,
      feeAmount: 10000
    }
  ],
  subjects: [
    {
      _id: 'offline-subject-math',
      title: 'Mathematics',
      classId: 'offline-class-math-10',
      code: 'OFF-MATH',
      teacherId: 'offline-teacher-academic',
      feeAmount: 0
    },
    {
      _id: 'offline-subject-science',
      title: 'Science',
      classId: 'offline-class-science-9',
      code: 'OFF-SCI',
      teacherId: 'offline-teacher-academic',
      feeAmount: 0
    }
  ],
  teachers: [
    {
      _id: 'offline-teacher-academic',
      name: 'Nokta Academy Teacher',
      email: 'teacher@nokta.local'
    }
  ]
};

export const offlineStudentTeacher = {
  _id: 'offline-teacher-academic',
  name: 'Nokta Academy Teacher',
  email: 'teacher@nokta.local',
  phone: '0700000000',
  whatsapp: '0700000000',
  whatsappLink: 'https://wa.me/0700000000'
};

export const offlineTimetable = [
  {
    _id: 'offline-timetable-1',
    className: 'Mathematics Foundations',
    subjectName: 'Mathematics',
    teacherName: 'Nokta Academy Teacher',
    dayOfWeek: 'saturday',
    startTime: '08:00',
    endTime: '09:30',
    room: 'Room A',
    deliveryMode: 'in_person',
    onlineLink: ''
  },
  {
    _id: 'offline-timetable-2',
    className: 'Science and Study Skills',
    subjectName: 'Science',
    teacherName: 'Nokta Academy Teacher',
    dayOfWeek: 'monday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Room B',
    deliveryMode: 'hybrid',
    onlineLink: 'https://forms.gle/offline-demo'
  },
  {
    _id: 'offline-timetable-3',
    className: 'Language Program',
    subjectName: 'English',
    teacherName: 'Language Faculty',
    dayOfWeek: 'wednesday',
    startTime: '14:00',
    endTime: '15:30',
    room: 'Room C',
    deliveryMode: 'online',
    onlineLink: 'https://forms.gle/offline-demo'
  }
];
