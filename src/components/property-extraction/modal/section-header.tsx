function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="border-b border-border pb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
      {title}
    </h4>
  );
}

export default SectionHeader;
