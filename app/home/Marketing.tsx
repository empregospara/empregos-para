export const Marketing = () => {
    return (
        <section className="flex rounded-md h-80 w-91 bg-slate-200 justify-center items-center md:h-96 sm:h-64">
            <video
                className="h-full w-full object-contain border rounded-md border-pink-500"
                src="assets/tutorial.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
        </section>
    );
};
