export default function StatCard({title,value}){

  return(

    <div className="bg-slate-900 border border-white/10 p-5 rounded-xl">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>

    </div>

  );

}