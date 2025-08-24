import { PrismaClient } from '../src/generated/prisma'
const prisma = new PrismaClient()

async function main() {

    // 3. Seed Skill
  const skillReact = await prisma.skill.create({
    data: {
      name: "react",
      icon: "devicon-react-original",
    },
  })

  const skillNode = await prisma.skill.create({
    data: {
      name: "Node.js",
      icon: "devicon-nodejs-plain",
    },
  })
  
  // 1. Seed About
  const about = await prisma.about.create({
    data: {
      name: "Muhammad Rizal Fahlevi",
      jobTitle: "Software Engineer",
      introduction: "Saya adalah seorang software engineer yang suka membangun aplikasi modern.",
      profilePicture: "/profile/default.png",
      createdAt: new Date(),
      updatedAt: new Date(),
      Skills: {
        connect: [{ id: skillReact.id }, { id: skillNode.id }],
      },
    },
  })

  // 2. Seed Sosmed
  await prisma.sosmed.createMany({
    data: [
      {
        name: "linkedin",
        url: "https://linkedin.com/in/example",
        aboutId: about.id,
      },
      {
        name: "github",
        url: "https://github.com/example",
        aboutId: about.id,
      },
    ],
  })

  // 4. Seed Project
  await prisma.project.create({
    data: {
      title: "Portfolio Website",
      description: "Website untuk menampilkan portofolio saya.",
      feature: ["Profile", "Projects", "Contact"],
      technology: ["React", "Typescript", "TailwindCSS"],
      githubUrl: "https://github.com/example/portfolio",
      liveUrl: "https://portfolio.example.com",
      thumbnail: "/thumbnails/default.png",
      photo: ["/photos/default.jpg"],
      Skills: {
        connect: [{ id: skillReact.id }, { id: skillNode.id }],
      },
      About: {
        connect: { id: about.id },
      },
    },
  })

  // 5. Seed WorkExperience
  await prisma.workExperience.create({
    data: {
      position: "Frontend Developer",
      employmenttype: "Full-time",
      company: "PT. Example",
      location: "Jakarta",
      locationtype: "Remote",
      description: ["Membangun aplikasi web", "Implementasi UI/UX"],
      startDate: new Date("2022-01-01"),
      endDate: null,
      Skills: {
        connect: [{ id: skillReact.id }],
      },
      About: {
        connect: { id: about.id },
      },
    },
  })

  await prisma.workExperience.create({
    data: {
      position: "Backend Developer",
      employmenttype: "Contract",
      company: "PT. Contoh",
      location: "Surabaya",
      locationtype: "On-site",
      description: ["Membangun aplikasi mobile", "Deploy aplikasi"],
      startDate: new Date("2022-01-01"),
      endDate: null,
      Skills: {
        connect: [{ id: skillReact.id }],
      },
      About: {
        connect: { id: about.id },
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })