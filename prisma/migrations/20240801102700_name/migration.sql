-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "timeLimit" INTEGER,
ADD COLUMN     "timelimitState" BOOLEAN,
ALTER COLUMN "encState" DROP NOT NULL,
ALTER COLUMN "encPass" DROP NOT NULL;
