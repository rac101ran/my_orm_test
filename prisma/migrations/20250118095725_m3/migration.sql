-- CreateTable
CREATE TABLE "_CategoryToGroupPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToGroupPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToGroupPost_B_index" ON "_CategoryToGroupPost"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToGroupPost" ADD CONSTRAINT "_CategoryToGroupPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGroupPost" ADD CONSTRAINT "_CategoryToGroupPost_B_fkey" FOREIGN KEY ("B") REFERENCES "GroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
