import { defineCollection, z } from 'astro:content';

const resumeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    contact: z.object({
      email: z.string(),
      portfolio: z.string(),
      github: z.string(),
    }),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      dates: z.string(),
      technologies: z.string().optional(),
      bullets: z.array(z.string()),
    })),
    projects: z.array(z.object({
      title: z.string(),
      url: z.string().optional(),
      technologies: z.string().optional(),
      bullets: z.array(z.string()),
    })),
    skills: z.array(z.object({
      category: z.string(),
      items: z.string(),
    })),
    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      date: z.string(),
    })),
  }),
});

export const collections = {
  'resume': resumeCollection,
}; 