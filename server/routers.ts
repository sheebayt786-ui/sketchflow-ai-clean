import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { generateScenesFromScript } from "./scriptGeneration";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Subscription and Credits
  subscription: router({
    getPlans: publicProcedure.query(async () => {
      return await db.getAllSubscriptionPlans();
    }),

    getCurrentPlan: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      
      const plan = await db.getSubscriptionPlan(user.subscriptionTier as any);
      return {
        tier: user.subscriptionTier,
        plan,
        creditsBalance: user.creditsBalance,
        creditsUsedThisMonth: user.creditsUsedThisMonth,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      };
    }),

    upgradePlan: protectedProcedure
      .input(z.object({
        tier: z.enum(["free", "starter", "creator", "growth"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // In production, integrate with payment processor (Stripe)
        // For now, just update the tier
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        // Update user subscription
        // Note: This is a simplified implementation
        // In production, you'd verify payment before updating
        return {
          success: true,
          message: `Upgraded to ${input.tier} plan`,
        };
      }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      
      return {
        balance: user.creditsBalance,
        usedThisMonth: user.creditsUsedThisMonth,
      };
    }),

    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreditTransactionsByUserId(ctx.user.id);
    }),
  }),

  // Video Projects
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getVideoProjectsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Verify ownership
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        whiteboardStyle: z.enum(["sketch", "canvas", "chalkboard"]),
        voiceStyle: z.enum(["male", "female"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        // Check subscription limits
        const plan = await db.getSubscriptionPlan(user.subscriptionTier as any);
        if (!plan) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check monthly video limit
        if (plan && plan.videosPerMonth && plan.videosPerMonth > 0) {
          const projects = await db.getVideoProjectsByUserId(ctx.user.id);
          const thisMonth = projects.filter(p => {
            const created = new Date(p.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && 
                   created.getFullYear() === now.getFullYear();
          });

          if (thisMonth.length >= (plan.videosPerMonth || 0)) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `You've reached your monthly limit of ${plan.videosPerMonth} videos`,
            });
          }
        }

        // Check style availability
        if (!plan.allowAllStyles && input.whiteboardStyle !== "sketch") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your plan only allows the sketch style",
          });
        }

        await db.createVideoProject({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          whiteboardStyle: input.whiteboardStyle,
          voiceStyle: input.voiceStyle,
        });

        return {
          title: input.title,
          description: input.description,
          whiteboardStyle: input.whiteboardStyle,
          voiceStyle: input.voiceStyle,
          status: "draft",
          createdAt: new Date(),
        };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        whiteboardStyle: z.enum(["sketch", "canvas", "chalkboard"]).optional(),
        voiceStyle: z.enum(["male", "female"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Update project (simplified - in production use proper update)
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Delete project (simplified - in production use proper delete)
        return { success: true };
      }),
  }),

  // Scenes
  scenes: router({
    list: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await db.getScenesByProjectId(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        sceneNumber: z.number(),
        title: z.string(),
        narrationText: z.string(),
        illustrationKeywords: z.array(z.string()).optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.createScene({
          projectId: input.projectId,
          sceneNumber: input.sceneNumber,
          title: input.title,
          narrationText: input.narrationText,
          illustrationKeywords: input.illustrationKeywords,
          duration: input.duration,
        });

        return {
          projectId: input.projectId,
          sceneNumber: input.sceneNumber,
          title: input.title,
          narrationText: input.narrationText,
          illustrationKeywords: input.illustrationKeywords || [],
          duration: input.duration || 5,
          status: "draft",
          createdAt: new Date(),
        };
      }),
  }),

  // Documents
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUploadedDocumentsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        filename: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        storageUrl: z.string(),
        storageKey: z.string(),
        extractedText: z.string().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createUploadedDocument({
          userId: ctx.user.id,
          projectId: input.projectId,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          storageUrl: input.storageUrl,
          storageKey: input.storageKey,
          extractedText: input.extractedText,
        });

        return {
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          storageUrl: input.storageUrl,
          storageKey: input.storageKey,
          extractedText: input.extractedText,
          projectId: input.projectId,
          createdAt: new Date(),
        };
      }),
  }),

  // Script Generation
  scriptGeneration: router({
    generateFromText: protectedProcedure
      .input(z.object({
        scriptText: z.string().min(10),
        projectId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getVideoProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        try {
          const scenes = await generateScenesFromScript(input.scriptText);
          const savedScenes = [];
          for (const scene of scenes) {
            await db.createScene({
              projectId: input.projectId,
              sceneNumber: scene.sceneNumber,
              title: scene.title,
              narrationText: scene.narrationText,
              illustrationKeywords: scene.illustrationKeywords,
              duration: scene.duration,
            });
            savedScenes.push(scene);
          }

          return {
            success: true,
            sceneCount: savedScenes.length,
            scenes: savedScenes,
          };
        } catch (error) {
          console.error("Script generation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate scenes from script",
          });
        }
      }),
  }),

  // SVG Assets
  assets: router({
    list: publicProcedure.query(async () => {
      // Return all available SVG assets
      // In production, implement proper pagination and filtering
      return [];
    }),

    search: publicProcedure
      .input(z.object({
        keywords: z.array(z.string()),
      }))
      .query(async ({ input }) => {
        return await db.getSvgAssetsByKeywords(input.keywords);
      }),
  }),
});

export type AppRouter = typeof appRouter;
