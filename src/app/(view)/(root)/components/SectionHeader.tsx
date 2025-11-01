export const SectionHeader = ({
    title,
    eyebrow,
    description,
}: {
    title: string;
    eyebrow: string;   
    description: string;
}) => {
    return (
        <>
            <div className="flex justify-center">
                <p className="uppercase font-semibold tracking-widest bg-gradient-to-r from-gray-400 to-gray-600 text-transparent bg-clip-text text-center">{eyebrow}</p>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-center mt-6 mx-5 md:mx-auto">{title}</h2>
            <p className="text-center mx-5 md:mx-auto md:text-lg lg:text-xl text-black/60 mt-4 max-w-md">{description}</p>
        </>
    );
}